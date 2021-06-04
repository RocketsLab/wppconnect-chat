<?php

namespace App\Http\Livewire;

use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Livewire\Component;
use WPPConnectTeam\Wppconnect\Facades\Wppconnect;

class Chats extends Component
{
    public Collection $chats;

    public $currentChat;

    public $url;

    public $session;

    public $token;

    protected $listeners = [
        'new-message' => 'newMessage',
    ];

    public function mount($chats)
    {
//        dd($chats);
        $this->chats = $chats;
        $this->url = config('wppconnect.defaults.base_uri');
        $this->session = "NERDWHATS_AMERICA";
        $this->token = env('WPP_TOKEN');
    }

    public function getAllChatsProperty()
    {
        return $this->chats;
    }

    public function render()
    {
        return view('livewire.chats');
    }

    public function selectChat($chatId)
    {
        $this->currentChat = $chatId;

        $this->chats = $this->chats->map(function ($chat) use ($chatId) {
            if ($chat['id']['_serialized'] == $chatId) {
                $this->sendSeen();
                $this->emit('chat-changed', $chat);
                $chat['unreadCount'] = 0;
                return $chat;
            }
            return $chat;
        });
    }

    public function newMessage($response)
    {
        $message = $response['response'];

        $this->chats = $this->chats->map(function ($chat) use ($message) {
            if (($message['chatId'] == $chat['id']['_serialized']) && ($chat['id']['_serialized'] != $this->currentChat)) {
                $chat['unreadCount']++;
            }
//            if ($message['chatId'] == $chat['id']['_serialized']) {
//                array_push($chat['msgs'], $message);
//            }
            return $chat;
        });
    }

    protected function sendSeen()
    {
        if ($this->currentChat) {
            Wppconnect::make($this->url)->to("/api/{$this->session}/send-seen")->withBody([
                'phone' => Str::replace("@c.us", "", $this->currentChat)
            ])->withHeaders([
                'Authorization' => "Bearer {$this->token}"
            ])->asJson()->post();
        }
    }
}

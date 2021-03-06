<?php

namespace App\Http\Livewire;

use Illuminate\Support\Str;
use Livewire\Component;
use WPPConnectTeam\Wppconnect\Facades\Wppconnect;

class Chat extends Component
{
    public array $messages = [];

    public $currentChat;

    public $url;

    public $session;

    public $token;

    protected $listeners = [
        'new-message' => 'newMessage',
        'chat-changed' => 'chatChanged'
    ];

    public function fromMe($message)
    {
        return isset($message['fromMe']);
    }

    public function mount()
    {
        $this->url = config('wppconnect.defaults.base_uri');
        $this->session = "NERDWHATS_AMERICA";
        $this->token = env('WPP_TOKEN');
    }

    public function render()
    {
        return view('livewire.chat');
    }

    public function newMessage($response)
    {
        $message = $response['response'];

        if($message['chatId'] == $this->currentChat) {
            $this->messages[] = $message;
            $this->sendSeen();
        }
    }

    public function chatChanged($chat)
    {
        $this->currentChat = $chat['id']['_serialized'];

        $phone = Str::replace("@c.us", "", $this->currentChat);
        $response =  Wppconnect::make($this->url)->to("/api/{$this->session}/chat-by-id/{$phone}")->withHeaders([
            'Authorization' => "Bearer {$this->token}"
        ])->asJson()->get();

        $this->messages = json_decode($response->getBody()->getContents(), true)['response'];
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

    public function getImage($messageId)
    {
        $response = Wppconnect::make($this->url)->to("/api/{$this->session}/get-media-by-message/{$messageId}")->withHeaders([
            'Authorization' => "Bearer {$this->token}"
        ])->asJson()->get();

        $message = json_decode($response->getBody()->getContents(), true);

        return $message;
    }
}

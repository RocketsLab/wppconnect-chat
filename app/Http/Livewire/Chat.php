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
        return (isset($message['id']['fromMe']) && $message['id']['fromMe']) || (isset($message['fromMe']) && $message['fromMe']);
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
        $this->currentChat = $chat['id'];
        $this->messages = $chat['msgs'];
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

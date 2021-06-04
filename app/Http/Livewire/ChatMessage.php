<?php

namespace App\Http\Livewire;

use Illuminate\Support\Str;
use Livewire\Component;
use WPPConnectTeam\Wppconnect\Facades\Wppconnect;


class ChatMessage extends Component
{
    public string $message = "";

    public $currentChat;

    protected $listeners = [
        'chat-changed' => 'chatChanged'
    ];

    public function render()
    {
        return view('livewire.chat-message');
    }

    public function mount()
    {
        //
    }

    public function sendMessage()
    {
        $url = config('wppconnect.defaults.base_uri');
        $session = "NERDWHATS_AMERICA";
        $token = env('WPP_TOKEN');

        Wppconnect::make($url)->to("/api/{$session}/send-message")->withBody([
            'phone' => Str::replace("@c.us", "", $this->currentChat),
            'message' => $this->message
        ])->withHeaders([
            'Authorization' => "Bearer {$token}"
        ])->asJson()->post();

        $this->message = "";
    }

    public function chatChanged($chat)
    {
        $this->currentChat = $chat['id'];
    }
}

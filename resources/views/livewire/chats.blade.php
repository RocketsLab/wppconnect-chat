<div>
    @foreach($this->allChats as $chat)
        <div wire:click="selectChat('{{ $chat['id'] }}')"
             class="cursor-pointer w-full border-b border-r border-gray-200 py-4 px-4 hover:bg-gray-100">
            <div class="flex justify-between">
                <span>{{ isset($chat['name']) ? $chat['name'] : str_replace("@c.us", "", $chat['id']) }}</span>
                @if($chat['unreadCount'])
                    <span class="p-1 rounded-full bg-green-500 text-white">{{ $chat['unreadCount'] }}</span>
                @endif
            </div>
        </div>
    @endforeach
</div>

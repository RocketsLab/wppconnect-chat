<div>
    @foreach($this->allChats as $chat)
        <div wire:click="selectChat('{{ $chat['id']['_serialized'] }}')"
             class="cursor-pointer w-full border-b border-r border-gray-200 py-4 px-4 hover:bg-gray-100">
            <div class="flex justify-between">
                <div class="flex items-center space-x-3">
                    <img src="{{ $chat['contact']['profilePicThumbObj']['eurl'] ?? asset("/images/zap-profile-default.jpg") }}" alt=""
                         class="object-fit h-12 w-12 rounded-full border-2 border-gray-600">
                    <span>{{ isset($chat['name']) ? $chat['name'] : str_replace("@c.us", "", $chat['id']['user']) }}</span>
                </div>
                @if($chat['unreadCount'])
                    <span class="font-bold rounded-full w-6 h-6 bg-green-500 text-white text-center">{{ $chat['unreadCount'] }}</span>
                @endif
            </div>
        </div>
    @endforeach
</div>

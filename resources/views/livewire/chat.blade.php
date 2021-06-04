<div class="overflow-y-scroll absolute inset-0 flex flex-col items-end mb-20" id="chat">
    @if(count($messages))
        @foreach($messages as $message)
            @if(in_array($message['type'], ['chat', 'image']))
                <div class="w-full py-4 px-8">
                    @if($this->fromMe($message))
                        <div class="flex justify-end">
                            <div class="bg-indigo-100 sm:text-right w-7/12 sm:rounded-lg py-3 px-4">
                                @if($message['type'] == 'chat')
                                    <p>{{ $message['body'] }}</p>
                                    <p class="text-gray-700">{{ \Illuminate\Support\Carbon::parse($message['t'])->subHours(3)->format("H:i") }}</p>
                                @else
                                    <img class="w-48" src="data:image/png;base64,{{ $this->getImage($message['id']['_serialized']) }}" alt="" />
                                    <p class="text-gray-700">{{ \Illuminate\Support\Carbon::parse($message['t'])->subHours(3)->format("H:i") }}</p>
                                @endif
                            </div>
                        </div>
                    @else
                        <div class="bg-yellow-100 sm:text-left w-7/12 rounded-lg py-3 px-4">
                            @if($message['type'] == 'chat')
                                <p>{{ $message['body'] }}</p>
                                <p class="text-gray-700">{{ \Illuminate\Support\Carbon::parse($message['t'])->subHours(3)->format("H:i") }}</p>
                            @else
                                <img class="w-48" src="data:image/png;base64,{{ $this->getImage($message['id']['_serialized']) }}" alt="" />
                                <p class="text-gray-700">{{ \Illuminate\Support\Carbon::parse($message['t'])->subHours(3)->format("H:i") }}</p>
                            @endif
                        </div>
                    @endif
                </div>
            @endif
        @endforeach
    @else
        <div class="flex mx-auto">
            <h1 class="text-xl text-gray-800">Selecione um chat</h1>
        </div>
    @endif
</div>

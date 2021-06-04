 <div class="flex w-full bg-gray-200">
     <form wire:submit.prevent="sendMessage" class="flex w-full">
        <input id="message" wire:model.debounce.500ms="message" class="border border-gray-200 p-3 w-full" type="text" />
        <button class="p-3 bg-green-500 text-white" type="submit">Send</button>
     </form>
</div>

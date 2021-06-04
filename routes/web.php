<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function (\WPPConnectTeam\Wppconnect\Wppconnect $wpp) {
    $url = config('wppconnect.defaults.base_uri');
    $session = "NERDWHATS_AMERICA";
    $token = env('WPP_TOKEN');

    $response =  $wpp->make($url)->to("/api/{$session}/all-chats-with-messages")->withHeaders([
        'Authorization' => "Bearer {$token}"
    ])->asJson()->get();

    $chats = collect(json_decode($response->getBody()->getContents(), true)['response']);

    return view('welcome', compact('chats'));

});

Route::get('wpp', function (\WPPConnectTeam\Wppconnect\Wppconnect $wpp) {

    $url = config('wppconnect.defaults.base_uri');
    $session = "NERDWHATS_AMERICA";
    $token = env('WPP_TOKEN');

    $phone = request('phone');

    if(!$phone) {
        abort(400, 'Parametro phone não especificado');
    }

    $response =  $wpp->make($url)->to("/api/{$session}/chat-by-id/{$phone}")->withHeaders([
        'Authorization' => "Bearer {$token}"
    ])->asJson()->get();

    return collect(json_decode($response->getBody()->getContents(), true)['response']);

});

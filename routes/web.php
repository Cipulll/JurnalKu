<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\JournalController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app');

Route::middleware('guest')->group(function (): void {
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth');

Route::prefix('api')->middleware('auth')->group(function (): void {
    Route::get('/bootstrap', [JournalController::class, 'bootstrap']);

    Route::post('/tasks', [JournalController::class, 'storeTask']);
    Route::patch('/tasks/{taskId}', [JournalController::class, 'updateTask'])->whereNumber('taskId');
    Route::delete('/tasks/{taskId}', [JournalController::class, 'deleteTask'])->whereNumber('taskId');

    Route::post('/transactions', [JournalController::class, 'storeTransaction']);
    Route::delete('/transactions/{transactionId}', [JournalController::class, 'deleteTransaction'])->whereNumber('transactionId');

    Route::post('/notes', [JournalController::class, 'storeNote']);
    Route::delete('/notes/{noteId}', [JournalController::class, 'deleteNote'])->whereNumber('noteId');
});

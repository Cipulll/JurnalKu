<?php

namespace App\Http\Controllers;

use App\Models\JournalEntry;
use App\Models\Task;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JournalController extends Controller
{
    public function bootstrap(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'tasks' => $user->tasks()->orderBy('due_date')->orderByDesc('created_at')->get()
                ->map(fn (Task $task) => $this->taskPayload($task)),
            'transactions' => $user->transactions()->orderByDesc('date')->orderByDesc('id')->get()
                ->map(fn (Transaction $transaction) => $this->transactionPayload($transaction)),
            'notes' => $user->journalEntries()->orderByDesc('date')->orderByDesc('id')->get()
                ->map(fn (JournalEntry $entry) => $this->notePayload($entry)),
        ]);
    }

    public function storeTask(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'date' => ['nullable', 'date'],
        ]);
        $task = $request->user()->tasks()->create([
            'title' => $data['title'],
            'due_date' => $data['date'] ?? null,
            'is_completed' => false,
        ]);

        return response()->json($this->taskPayload($task), 201);
    }

    public function updateTask(Request $request, int $taskId): JsonResponse
    {
        $task = $request->user()->tasks()->findOrFail($taskId);
        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:160'],
            'date' => ['sometimes', 'nullable', 'date'],
            'done' => ['sometimes', 'boolean'],
        ]);

        $task->fill([
            ...array_key_exists('title', $data) ? ['title' => $data['title']] : [],
            ...array_key_exists('date', $data) ? ['due_date' => $data['date']] : [],
            ...array_key_exists('done', $data) ? ['is_completed' => $data['done']] : [],
        ])->save();

        return response()->json($this->taskPayload($task->refresh()));
    }

    public function deleteTask(Request $request, int $taskId): JsonResponse
    {
        $request->user()->tasks()->findOrFail($taskId)->delete();

        return response()->json([], 204);
    }

    public function storeTransaction(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'category' => ['required', 'string', 'max:80'],
            'amount' => ['required', 'integer', 'min:1', 'max:999999999999'],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'date' => ['required', 'date'],
        ]);
        $transaction = $request->user()->transactions()->create($data);

        return response()->json($this->transactionPayload($transaction), 201);
    }

    public function deleteTransaction(Request $request, int $transactionId): JsonResponse
    {
        $request->user()->transactions()->findOrFail($transactionId)->delete();

        return response()->json([], 204);
    }

    public function storeNote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'body' => ['required', 'string', 'max:10000'],
            'date' => ['required', 'date'],
        ]);
        $entry = $request->user()->journalEntries()->create($data);

        return response()->json($this->notePayload($entry), 201);
    }

    public function deleteNote(Request $request, int $noteId): JsonResponse
    {
        $request->user()->journalEntries()->findOrFail($noteId)->delete();

        return response()->json([], 204);
    }

    private function taskPayload(Task $task): array
    {
        return [
            'id' => $task->id,
            'title' => $task->title,
            'dueDate' => $task->due_date?->format('Y-m-d'),
            'done' => $task->is_completed,
        ];
    }

    private function transactionPayload(Transaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'title' => $transaction->title,
            'category' => $transaction->category,
            'amount' => $transaction->amount,
            'type' => $transaction->type,
            'date' => $transaction->date->format('Y-m-d'),
        ];
    }

    private function notePayload(JournalEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'title' => $entry->title,
            'body' => $entry->body,
            'date' => $entry->date->format('Y-m-d'),
        ];
    }
}

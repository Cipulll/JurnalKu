<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_journal_data_requires_an_authenticated_user(): void
    {
        $this->getJson('/api/bootstrap')->assertUnauthorized();
    }

    public function test_a_user_can_register_and_manage_journal_data(): void
    {
        $this->postJson('/auth/register', [
            'name' => 'Rani',
            'email' => 'Rani@example.com',
            'password' => 'rahasia-aman-123',
            'password_confirmation' => 'rahasia-aman-123',
        ])->assertCreated()->assertJsonPath('user.name', 'Rani');

        $task = $this->postJson('/api/tasks', [
            'title' => 'Selesaikan satu hal',
            'date' => '2026-10-21',
        ])->assertCreated()
            ->assertJsonPath('title', 'Selesaikan satu hal')
            ->assertJsonPath('done', false)
            ->json();

        $this->patchJson('/api/tasks/'.$task['id'], ['done' => true])
            ->assertOk()
            ->assertJsonPath('done', true);

        $transaction = $this->postJson('/api/transactions', [
            'title' => 'Kopi',
            'category' => 'Makanan',
            'amount' => 25000,
            'type' => 'expense',
            'date' => '2026-10-21',
        ])->assertCreated()
            ->assertJsonPath('amount', 25000)
            ->assertJsonPath('type', 'expense')
            ->json();

        $note = $this->postJson('/api/notes', [
            'title' => 'Hari yang baik',
            'body' => 'Satu langkah kecil tetap berarti.',
            'date' => '2026-10-21',
        ])->assertCreated()
            ->assertJsonPath('body', 'Satu langkah kecil tetap berarti.')
            ->json();

        $this->getJson('/api/bootstrap')
            ->assertOk()
            ->assertJsonPath('user.email', 'rani@example.com')
            ->assertJsonCount(1, 'tasks')
            ->assertJsonCount(1, 'transactions')
            ->assertJsonCount(1, 'notes');

        $this->deleteJson('/api/tasks/'.$task['id'])->assertNoContent();
        $this->deleteJson('/api/transactions/'.$transaction['id'])->assertNoContent();
        $this->deleteJson('/api/notes/'.$note['id'])->assertNoContent();
    }

    public function test_users_cannot_access_another_users_records(): void
    {
        $owner = User::factory()->create();
        $task = $owner->tasks()->create([
            'title' => 'Tugas rahasia',
            'is_completed' => false,
        ]);
        $otherUser = User::factory()->create();

        $this->actingAs($otherUser)
            ->getJson('/api/bootstrap')
            ->assertOk()
            ->assertJsonCount(0, 'tasks');

        $this->deleteJson('/api/tasks/'.$task->id)->assertNotFound();
    }

    public function test_invalid_transactions_return_validation_errors(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/transactions', [
                'title' => '',
                'category' => 'Makanan',
                'amount' => -1,
                'type' => 'transfer',
                'date' => 'not-a-date',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'amount', 'type', 'date']);
    }
}

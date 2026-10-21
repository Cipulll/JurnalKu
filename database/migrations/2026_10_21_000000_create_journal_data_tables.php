<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->date('due_date')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'due_date']);
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->string('category', 80);
            $table->unsignedBigInteger('amount');
            $table->string('type', 10);
            $table->date('date');
            $table->timestamps();
            $table->index(['user_id', 'date']);
        });

        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->text('body');
            $table->date('date');
            $table->timestamps();
            $table->index(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('tasks');
    }
};

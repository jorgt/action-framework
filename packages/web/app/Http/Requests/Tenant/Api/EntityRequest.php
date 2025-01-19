<?php

namespace App\Http\Requests\Tenant\Api;

use Illuminate\Foundation\Http\FormRequest;

class EntityRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'id' => 'required|uuid',
      'name' => 'required|string',
      'created_at' => 'required|date',
      'updated_at' => 'required|date',
      'status_code' => 'required|string',
      'entity_type' => 'required|string',
      'locked' => 'boolean',
      'status_description' => 'required|string',
      'sequences' => 'array',
      'sequences.*.sequence_id' => 'required|uuid',
      'sequences.*.sequence_code' => 'required|string',
      'sequences.*.sequence_description' => 'required|string',
      'sequences.*.status_on_sequence_success_code' => 'required|string',
      'sequences.*.status_on_sequence_failure_code' => 'required|string',
    ];
  }
}

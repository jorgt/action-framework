<?php

namespace App\Http\Requests\Tenant\Api;

use Illuminate\Foundation\Http\FormRequest;

class WebhookRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'headers' => 'required|array',
      'headers.*.name' => 'required|string',
      'headers.*.value' => 'required|string',
      'parameters' => 'required|array',
      'parameters.*.name' => 'required|string',
      'parameters.*.value' => 'required|string',
      'url' => 'required|string|url',
      'method' => 'required|string|in:GET,POST,PUT,DELETE,PATCH',
      'fields' => 'required|array',
      'fields.*.name' => 'required|string',
      'fields.*.type' => 'required|string',
      'name' => 'required|string'
    ];
  }
}

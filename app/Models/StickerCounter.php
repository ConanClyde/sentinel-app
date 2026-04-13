<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StickerCounter extends Model
{
    protected $table = 'sticker_counters';

    protected $fillable = [
        'color',
        'count',
    ];
}

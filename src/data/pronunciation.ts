export interface Sound {
  letters: string
  description: string
  example: string
  exampleMeaning: string
}

// The sounds that differ from what an English reader would guess.
// Everything not listed here sounds roughly the way it's written.
export const SOUNDS: Sound[] = [
  { letters: 'a', description: '“ah” as in father', example: 'apa', exampleMeaning: 'what' },
  { letters: 'e', description: 'usually a soft “uh” (about), sometimes “eh” (bed)', example: 'empat', exampleMeaning: 'four' },
  { letters: 'i', description: '“ee” as in see', example: 'ikan', exampleMeaning: 'fish' },
  { letters: 'o', description: '“oh” as in go', example: 'orang', exampleMeaning: 'person' },
  { letters: 'u', description: '“oo” as in food', example: 'minum', exampleMeaning: 'to drink' },
  { letters: 'ai', description: '“eye” as in aisle', example: 'pantai', exampleMeaning: 'beach' },
  { letters: 'au', description: '“ow” as in cow', example: 'mau', exampleMeaning: 'to want' },
  { letters: 'c', description: 'always “ch” as in chat — never like “k” or “s”', example: 'cantik', exampleMeaning: 'beautiful' },
  { letters: 'g', description: 'always hard, as in go', example: 'gigi', exampleMeaning: 'tooth' },
  { letters: 'j', description: 'as in jam', example: 'jalan', exampleMeaning: 'street' },
  { letters: 'ng', description: 'as in singer (no hard g)', example: 'hidung', exampleMeaning: 'nose' },
  { letters: 'ngg', description: 'as in finger (ng + hard g)', example: 'minggu', exampleMeaning: 'week' },
  { letters: 'ny', description: 'as in canyon', example: 'monyet', exampleMeaning: 'monkey' },
  { letters: 'r', description: 'lightly rolled or tapped', example: 'rumah', exampleMeaning: 'house' },
  { letters: 'h', description: 'soft and gently breathed', example: 'hari', exampleMeaning: 'day' },
  { letters: 'k (word end)', description: 'cut short — a small catch in the throat', example: 'tidak', exampleMeaning: 'no / not' },
]

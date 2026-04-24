'use client';

import { useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input, Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { joinEventAction, type JoinState } from './actions';

const initialState: JoinState = { status: 'idle' };

const LIKE_CHIPS = [
  'Books',
  'Coffee',
  'Plants',
  'Stationery',
  'Snacks',
  'Board games',
  'Music',
  'Cooking',
];

const SHIRT_SIZES: { value: string; label: string }[] = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'xxl', label: 'XXL' },
  { value: 'none', label: 'Prefer not to say' },
];

// Triggers the shirt-size field when the user mentions clothing in their likes.
const CLOTHING_RE = /\b(dress(es)?|t-?shirts?|shirts?|clothes|clothing)\b/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface JoinFormProps {
  eventSlug: string;
  eventName: string;
}

export function JoinForm({ eventSlug, eventName }: JoinFormProps) {
  const boundAction = joinEventAction.bind(null, eventSlug);
  const [state, formAction] = useFormState(boundAction, initialState);

  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [shirtSize, setShirtSize] = useState('');

  const selectedChips = useMemo(
    () =>
      new Set(
        likes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    [likes],
  );

  const needsShirtSize = useMemo(() => CLOTHING_RE.test(likes), [likes]);

  const liveBudgetError = (() => {
    if (budget.trim() === '') return null;
    const n = Number(budget);
    if (!Number.isFinite(n)) return 'Enter a number';
    if (!Number.isInteger(n)) return 'Whole rupees only';
    if (n < 500) return '₹500 minimum';
    return null;
  })();

  const isComplete =
    name.trim().length > 0 &&
    team.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    budget.trim() !== '' &&
    !liveBudgetError &&
    likes.trim().length > 0 &&
    dislikes.trim().length > 0 &&
    (!needsShirtSize || shirtSize !== '');

  if (state.status === 'success') {
    return (
      <div className="space-y-4 rounded-2xl border border-gold/40 bg-white/80 p-6 text-center">
        <h2 className="font-display text-2xl text-forest">You&rsquo;re in.</h2>
        <p className="text-sm text-forest/80">
          We sent a sign-in link to <span className="font-medium">{state.email}</span>. Check your
          inbox to view your dashboard for {eventName}.
        </p>
        <p className="text-xs text-forest/50">
          Didn&rsquo;t receive it? Resubmit the form below with the same email to resend.
        </p>
      </div>
    );
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors ?? {} : {};
  const formError = state.status === 'error' ? state.message : undefined;

  const budgetError = liveBudgetError ?? fieldErrors.budget_amount;

  function toggleChip(chip: string) {
    const items = likes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = items.includes(chip) ? items.filter((x) => x !== chip) : [...items, chip];
    setLikes(next.join(', '));
  }

  return (
    <form action={formAction} className="space-y-5">
      {formError && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {formError}
        </div>
      )}

      <FormField label="Name" htmlFor="name" error={fieldErrors.name}>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormField>

      <FormField label="Team" htmlFor="team" error={fieldErrors.team}>
        <Input
          id="team"
          name="team"
          type="text"
          required
          placeholder="e.g. Engineering"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        />
      </FormField>

      <FormField label="Work email" htmlFor="email" error={fieldErrors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormField>

      <FormField
        label="Budget (₹)"
        htmlFor="budget_amount"
        hint="₹500 minimum. You&rsquo;ll be matched with someone in a similar budget range."
        error={budgetError}
      >
        <Input
          id="budget_amount"
          name="budget_amount"
          type="number"
          min={500}
          step={100}
          required
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          aria-invalid={budgetError ? true : undefined}
        />
      </FormField>

      <FormField
        label="Three things you genuinely enjoy"
        htmlFor="wishlist_likes"
        hint="Tap a chip to add it, or write your own."
        error={fieldErrors.wishlist_likes}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {LIKE_CHIPS.map((chip) => {
              const selected = selectedChips.has(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip(chip)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition',
                    selected
                      ? 'border-forest bg-forest text-cream'
                      : 'border-forest/20 bg-white text-forest hover:border-forest/40',
                  )}
                >
                  {chip}
                </button>
              );
            })}
          </div>
          <Textarea
            id="wishlist_likes"
            name="wishlist_likes"
            rows={3}
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            placeholder="e.g. filter coffee, paperbacks, long walks"
          />
        </div>
      </FormField>

      <FormField
        label="One thing you&rsquo;d never want as a gift"
        htmlFor="wishlist_dislikes"
        error={fieldErrors.wishlist_dislikes}
      >
        <Textarea
          id="wishlist_dislikes"
          name="wishlist_dislikes"
          rows={2}
          value={dislikes}
          onChange={(e) => setDislikes(e.target.value)}
        />
      </FormField>

      {needsShirtSize && (
        <FormField
          label="Shirt size"
          htmlFor="shirt_size"
          hint="You mentioned clothing — let your Santa know what fits."
          error={fieldErrors.shirt_size}
        >
          <select
            id="shirt_size"
            name="shirt_size"
            required
            value={shirtSize}
            onChange={(e) => setShirtSize(e.target.value)}
            className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest focus:border-forest/40 focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            <option value="" disabled>
              Select your size
            </option>
            {SHIRT_SIZES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <SubmitButton disabled={!isComplete} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full">
      {pending ? 'Signing you up…' : 'Join the draw'}
    </Button>
  );
}

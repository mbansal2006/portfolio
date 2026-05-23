import { useEffect, useState } from 'react';

type Poem = {
  title: string;
  author: string;
  body: string;
  color: string;
  rotate: number;
};

// TODO: fill in the body text for each poem
const POEMS: Poem[] = [
  { title: 'Good Bones', author: 'Maggie Smith', body: `Life is short, though I keep this from my children.
Life is short, and I’ve shortened mine
in a thousand delicious, ill-advised ways,
a thousand deliciously ill-advised ways
I’ll keep from my children. The world is at least
fifty percent terrible, and that’s a conservative
estimate, though I keep this from my children.
For every bird there is a stone thrown at a bird.
For every loved child, a child broken, bagged,
sunk in a lake. Life is short and the world
is at least half terrible, and for every kind
stranger, there is one who would break you,
though I keep this from my children. I am trying
to sell them the world. Any decent realtor,
walking you through a real shithole, chirps on
about good bones: This place could be beautiful,
right? You could make this place beautiful.`, color: '#f3ecdb', rotate: -2.4 },
  { title: 'Last Words', author: 'Rita Dove', body:  `I don't want to die in a poem
The words burning in eulogy
the sun howling why
the moon sighing why not

I don't want to die in bed
which is a poem gone wrong
a world turning in on itself
a floating navel of reams

I won't meet death in a field
like a dot punctuating a page
it's too vast yet too tiny
everyone will say it's a bit cinematic

I don't want you to pass away in your arms
those gentle parentheses
nor expire outside of their swoon

self-propelled determined shouting Let the end come 
as the best parts of living have come
unsought and undeserved
inconvenient

now that's a good death

what nonsense you say 
that's not even worth writing down`, color: '#e8d8d2', rotate: 1.8 },
  { title: 'Otherwise', author: 'Jane Kenyon', body: `I got out of bed
on two strong legs.
It might have been
otherwise. I ate
cereal, sweetmilk, ripe,
flawless peach. It might
have been otherwise.
I took the dog uphill
to the birch wood.
All morning I did
the work I love.
At noon I lay down
with my mate. It might
have been otherwise.
We ate dinner together
at a table with silver
candlesticks. It might
have been otherwise.
I slept in a bed
in a room with paintings
on the walls, and
planned another day
just like this day.
But one day, I know,
it will be otherwise.`, color: '#dbe2d2', rotate: -1.2 },
  { title: 'A Brief for the Defense', author: 'Jack Gilbert', body: `Sorrow everywhere. Slaughter everywhere. If babies
are not starving someplace, they are starving
somewhere else. With flies in their nostrils.
But we enjoy our lives because that's what God wants.
Otherwise the mornings before summer dawn would not
be made so fine. The Bengal tiger would not
be fashioned so miraculously well. The poor women
at the fountain are laughing together between
the suffering they have known and the awfulness
in their future, smiling and laughing while somebody
in the village is very sick. There is laughter
every day in the terrible streets of Calcutta,
and the women laugh in the cages of Bombay.
If we deny our happiness, resist our satisfaction,
we lessen the importance of their deprivation.
We must risk delight. We can do without pleasure,
but not delight. Not enjoyment. We must have
the stubbornness to accept our gladness in the ruthless
furnace of this world. To make injustice the only
measure of our attention is to praise the Devil.
If the locomotive of the Lord runs us down,
we should give thanks that the end had magnitude.
We must admit there will be music despite everything.
We stand at the prow again of a small ship
anchored late at night in the tiny port
looking over to the sleeping island: the waterfront
is three shuttered cafés and one naked light burning.
To hear the faint sound of oars in the silence as a rowboat
comes slowly out and then goes back is truly worth
all the years of sorrow that are to come.`, color: '#d8dde3', rotate: 2.6 },
  { title: 'First Fall', author: 'Maggie Smith', body: `I’m your guide here. In the evening-dark
morning streets, I point and name.
Look, the sycamores, their mottled,
paint-by-number bark. Look, the leaves
rusting and crisping at the edges.
I walk through Schiller Park with you
on my chest. Stars smolder well
into daylight. Look, the pond, the ducks,
the dogs paddling after their prized sticks.
Fall is when the only things you know
because I’ve named them
begin to end. Soon I’ll have another
season to offer you: frost soft
on the window and a porthole
sighed there, ice sleeving the bare
gray branches. The first time you see
something die, you won’t know it might
come back. I’m desperate for you
to love the world because I brought you here.`, color: '#ead7c2', rotate: -2.8 },
  { title: 'Wild Geese', author: 'Mary Oliver', body: `You do not have to be good.
You do not have to walk on your knees
For a hundred miles through the desert, repenting.
You only have to let the soft animal of your body
love what it loves.
Tell me about despair, yours, and I will tell you mine.
Meanwhile the world goes on.
Meanwhile the sun and the clear pebbles of the rain
are moving across the landscapes,
over the prairies and the deep trees,
the mountains and the rivers.
Meanwhile the wild geese, high in the clean blue air,
are heading home again.
Whoever you are, no matter how lonely,
the world offers itself to your imagination,
calls to you like the wild geese, harsh and exciting --
over and over announcing your place
in the family of things.`, color: '#e2dde9', rotate: 1.4 },
  { title: 'The Use of Sorrow', author: 'Mary Oliver', body: `(In my sleep I dreamed this poem)
Someone I loved once gave me
a box full of darkness.
It took me years to understand
that this, too, was a gift.`, color: '#e7e0c4', rotate: -1.6 },
  { title: 'Failing and Flying', author: 'Jack Gilbert', body: `Everyone forgets that Icarus also flew.
It’s the same when love comes to an end,
or the marriage fails and people say
they knew it was a mistake, that everybody
said it would never work. That she was
old enough to know better. But anything
worth doing is worth doing badly.
Like being there by that summer ocean
on the other side of the island while
love was fading out of her, the stars
burning so extravagantly those nights that
anyone could tell you they would never last.
Every morning she was asleep in my bed
like a visitation, the gentleness in her
like antelope standing in the dawn mist.
Each afternoon I watched her coming back
through the hot stony field after swimming,
the sea light behind her and the huge sky
on the other side of that. Listened to her
while we ate lunch. How can they say
the marriage failed? Like the people who
came back from Provence (when it was Provence)
and said it was pretty but the food was greasy.
I believe Icarus was not failing as he fell,
but just coming to the end of his triumph.`, color: '#dcd6cb', rotate: 2.2 },
  { title: 'A Ritual to Read to Each Other', author: 'William E. Stafford', body: `If you don't know the kind of person I am
and I don't know the kind of person you are
a pattern that others made may prevail in the world
and following the wrong god home we may miss our star.

For there is many a small betrayal in the mind,
a shrug that lets the fragile sequence break
sending with shouts the horrible errors of childhood
storming out to play through the broken dike.

And as elephants parade holding each elephant's tail,
but if one wanders the circus won't find the park,
I call it cruel and maybe the root of all cruelty
to know what occurs but not recognize the fact.

And so I appeal to a voice, to something shadowy,
a remote important region in all who talk:
though we could fool each other, we should consider—
lest the parade of our mutual life get lost in the dark.

For it is important that awake people be awake,
or a breaking line may discourage them back to sleep;
the signals we give — yes or no, or maybe —
should be clear: the darkness around us is deep.`, color: '#e3e8d6', rotate: -2 },
{
  title: 'Arcadia (tidbits)',
  author: 'Tom Stoppard',
  body: `Thomasina: When you stir your rice pudding, Septimus, the spoonful of jam spreads itself round making red trails like the picture of a meteor in my astronomical atlas. But if you stir backwards, the jam will not come
together again. Indeed, the pudding does not notice and continues to turn
pinkjust as before. Do you think this is odd?

Septimus: No.

Thomasina: Well, I do. You cannot stir things apart.

Septimus: No more you can, time must needs run backward, and since it will
not, we must stir our way onward mixing as we go, disorder out ofdisorder
into disorder until pink is complete, unchanging and unchangeable, and we
are done with it for ever. This is known as free will or self-determination.
(He picks up the tortoise and moves it afew inches as though it hadstrayed,
on top of some loose papers, and admonishes it) Sit!

Thomasina Septimus, do you think God is a Newtonian?

Septimus: An Etonian? Almost certainly, I'm afraid. We must ask your
brother to make it his first enquiry.

Thomasina: No, Septimus, a Newtonian. Septimus! Am I the first person to
have thought of this?

Septimus: No.

Thomasina: I have not said yet.

Septimus: "If everything from the furthest planet to the smallest atom of our
brain acts according to Newton's law of motion, what becomes of free
will?"

...

Valentine: Actually I'm doing it from the other end. She started with an
equation and turned it into a graph. I've got a graph-real data-and I'm
trying to find the equation which would give you the graph if you used it
the way she's used hers. Iterated it.

Hannah: What for?

Valentine: It's how you look at population changes in biology. Goldfish in
a pond, say. This year there are x goldfish. Next year there'llbe y goldfish.
Some get born, some get eaten by herons, whatever. Nature manipulates
the x and turns it into y. Then y goldfish is your starting population for the
following year. Just like Thomasina. Your value for y becomes your next
value for x. The question is: what is being done to x? What is the
manipulation? Whatever it is, it can be written down as mathematics. It's
called an algorithm.

Hannah: It can't be the same every year.

Valentine: The details change, you can't keep tabs on everything, it's not
nature in a box. But it isn't necessary to know the details. When they are
all put together, it turns out the population is obeying a mathematical rule.

Hannah: The goldfish are?

Valentine: Yes. No. The numbers. It's not about the behaviour of fish. It's
about the behaviour of numbers. This thing works for any phenomenon
which eats its own numbers -measles epidemics, rainfall averages,
cotton prices, it's a natural phenomenon in itself. Spooky.

Hannah: Does it work for grouse?

Valentine: I don't know yet. I mean, it does undoubtedly, but it's hard to
show. There's more noise with grouse.

Hannah: Noise?

Valentine: Distortions. Interference. Real data is messy. There's a thousand
acres of moorland that had grouse on it, always did till about 1930. But
nobody counted the grouse. They shot them. So you count the grouse they
shot. But burning the heather interferes, it improves the food supply. Agood year for foxes interferes the other way, they eat the chicks. And then
there's the weather. It's all very, very noisy out there. Very hard to spot the
tune. Like a piano in the next room, it's playing your song, but unfortunately it's out of whack, some of the strings are missing, and the pianist is tone
deaf and drunk -I mean, the noise! Impossible!

Hannah: What do you do?

Valentine: You start guessing what the tune might be. You try to pick it out
of the noise. You try this, youtry that, you start to get something-it's halfbaked but you start putting in notes which are missing or not quite the right notes ... and bit by bit ... (He starts to dumdi-da to the tune of "Happy Birthday") Dumdi-dum-dum, dear Val-en-tine, dumdi-dum-dum to you
-the lost algorithm!

...

Hannah: You mustn't give up.

Valentine: Why? Didn't you agree with Bernard?

Hannah: Oh, that. It's all trivial-your grouse, my hermit, Bernard's Byron.
Comparing what we're looking for misses the point. It's wanting to know
that makes us matter. Otherwise we're going out the way we came in.
That's why you can't believe inthe afterlife, Valentine. Believe inthe after,
by all means,but not the life. Believe in God, the soul,the spirit, the infinite,
believe in angels if you like, but not in the great celestial get-together for
an exchange of views. Ifthe answers are in the back of the book Ican wait,
but what a drag. Better to struggle on knowing that failure is final. (She
looks over Valentine's shoulder at the computer screen. Reacting) Oh! but
... how beautiful!`,
  color: '#e2dde9',
  rotate: 1.4,
}
];

const noteFont = `'Iowan Old Style', 'Palatino Linotype', Georgia, 'Times New Roman', serif`;

type PoemsWallProps = {
  onClose?: () => void;
};

const PoemsWall = ({ onClose }: PoemsWallProps) => {
  const [focused, setFocused] = useState<number | null>(null);

  useEffect(() => {
    if (focused === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused]);

  const focusedPoem = focused !== null ? POEMS[focused] : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#161514',
        overflowY: 'auto',
        padding: '6vh 4vw',
        fontFamily: noteFont,
      }}
    >
      {onClose && (
        <button
          type="button"
          aria-label="Back"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            zIndex: 30,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '36px',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {POEMS.map((poem, i) => (
          <StickyNote
            key={i}
            poem={poem}
            onClick={() => setFocused(i)}
          />
        ))}
      </div>

      {focusedPoem && (
        <div
          onClick={() => setFocused(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(8, 8, 8, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4vh 4vw',
            cursor: 'zoom-out',
            zIndex: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: focusedPoem.color,
              color: '#222019',
              padding: '48px clamp(40px, 6vw, 72px)',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              borderRadius: '2px',
              boxShadow:
                '0 1px 1px rgba(0,0,0,0.06), 0 18px 48px rgba(0,0,0,0.45)',
              cursor: 'default',
            }}
          >
            <PoemContent poem={focusedPoem} focused />
          </div>
        </div>
      )}
    </div>
  );
};

const StickyNote = ({ poem, onClick }: { poem: Poem; onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: poem.color,
        color: '#26241d',
        border: 'none',
        borderRadius: '2px',
        padding: '26px 28px',
        height: '320px',
        textAlign: 'left',
        cursor: 'pointer',
        transform: `rotate(${poem.rotate}deg)`,
        boxShadow:
          '0 1px 1px rgba(0,0,0,0.06), 0 8px 22px rgba(0,0,0,0.22)',
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 220ms ease, box-shadow 220ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `rotate(${poem.rotate * 0.4}deg) translateY(-3px)`;
        e.currentTarget.style.boxShadow =
          '0 1px 1px rgba(0,0,0,0.08), 0 14px 28px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${poem.rotate}deg)`;
        e.currentTarget.style.boxShadow =
          '0 1px 1px rgba(0,0,0,0.06), 0 8px 22px rgba(0,0,0,0.22)';
      }}
    >
      <PoemContent poem={poem} focused={false} />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60px',
          background: `linear-gradient(to bottom, transparent, ${poem.color})`,
          pointerEvents: 'none',
        }}
      />
    </button>
  );
};

const PoemContent = ({ poem, focused }: { poem: Poem; focused: boolean }) => {
  return (
    <>
      <h3
        style={{
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: focused ? '28px' : '19px',
          lineHeight: 1.2,
          marginBottom: focused ? '6px' : '4px',
          letterSpacing: '0.01em',
        }}
      >
        {poem.title}
      </h3>
      <p
        style={{
          fontSize: focused ? '13px' : '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          opacity: 0.62,
          marginBottom: focused ? '28px' : '16px',
        }}
      >
        {poem.author}
      </p>
      <div
        style={{
          whiteSpace: 'pre-line',
          fontSize: focused ? '17px' : '13px',
          lineHeight: focused ? 1.7 : 1.55,
          fontFamily: 'inherit',
        }}
      >
        {poem.body}
      </div>
    </>
  );
};

export default PoemsWall;

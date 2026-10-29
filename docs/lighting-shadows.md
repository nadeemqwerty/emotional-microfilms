# Lighting and shadows: researched direction and production controls

Dedicated follow-up, 30 October 2026, IST. We previously covered motivated light
and palette; this adds source quality, fill, modeling, shadow edges and continuity.
No actual generated-lighting benchmark has been performed.

## Literature actually consulted

| ID | Source / scope read | What it establishes |
|---|---|---|
| L1 | Bill Holshevnikoff, *ARRI Lighting Handbook*, fourth edition, copyright 2016. [Official landing page](https://www.arri.com/en/learn/lighting/lighting-handbook), [official English PDF](https://www.arri.com/resource/blob/83996/409091c612f371b0c68b41d9dcb636db/arri-lighting-handbook-english-data.pdf). Printed pp.4-17 read with an existing PDF reader. | pp.5-8: source size/diffusion, hard/soft edges and spill; p.9: intensity/focus tradeoffs; pp.10-11: color balance; pp.12-15: key/fill/separation/background; pp.16-17: diffuse/specular/shadow modeling and edge transfer. |
| L2 | [Yale: Mise-en-scene, Lighting section](https://filmanalysis.yale.edu/mise-en-scene/) | Intensity, direction and quality shape perception; key/fill/backlight; high-/low-key conventions. Descriptive analysis, not universal emotion mapping. |
| L3 | [ASC / Jackson Parrell production account](https://theasc.com/article/heated-rivalry-cinematography/) | Motivated practical sources, simple blocking and designed warm/cool contrast in one production. Case study, not experimental emotion evidence. |

These are professional/academic craft sources. They do not prove a specific
shadow releases dopamine or makes a Reel perform better. StudioBinder pages
returned 403 and two guessed tutorial routes returned 404; no claims rely on them.
No handbook text, photographs or diagrams are redistributed in this repository.

## Core distinctions

| Control | Meaning / production consequence |
|---|---|
| Direction | Where illumination arrives from; models faces and determines plausible shadow orientation |
| Hard/soft quality | Shadow-edge character; larger effective apparent source tends to soften edges |
| Intensity | Amount of light, not softness; brighter is not automatically better |
| Key/fill relationship | Degree of modeling/contrast; a soft key can still have deep shadow if fill is low |
| Spill | Light reaching unintended areas; soft light can flatten the background if uncontrolled |
| Separation | Subject/background distinction; use motivated edge, tone or color difference, not obligatory glowing rims |
| Color / white balance | Source appearance and rendered neutrality; mixed sources need an intentional relationship |
| Form shadow | Shading on the object's surface that describes its shape |
| Cast shadow | Occlusion projected onto another surface; track the caster, receiver and source |
| Contact darkening | Local grounding at a touching point; inspect rather than accepting floating hands/feet |
| Specular response | Source reflection/highlight behavior; not interchangeable with cast shadow |

The handbook emphasizes physical source size; as a geometric production
clarification, describe its **apparent size at the subject**, not only fixture
dimensions. Subject/source/receiver distances also affect visible shadow shape.
These are image-direction controls, not parameters that an image model physically
simulates or guarantees.

**Soft is not the same as flat; hard is not the same as harsh emotion.** Hard
sunlight can depict joyful play. A soft low-fill scene can feel intimate or tense
depending on action and context. Neither "warm means happy" nor "dark means evil"
is an evidence-backed universal.

## A simple light map before a prompt

For each shot specify:

1. **Dramatic job:** what must the audience see or overlook at this moment?
2. **Motivation:** window, cloudy sky, lamp, doorway, screen, streetlight.
3. **Key:** screen/camera side, relative height, direction and edge softness.
4. **Fill:** how much shadow information is retained and where it comes from.
5. **Separation/background:** just enough to read the subject and critical prop.
6. **Exposure priority:** essential eyes/gesture/prop; avoid crushed clues or
   clipped highlights that obscure the choice.
7. **Shadow map:** caster -> receiver -> expected direction/edge/contact.
8. **Continuity:** what stays fixed and exactly what may change over time.

Bounce fill uses a broader reflected source; reducing uncontrolled reflection
preserves contrast. "Negative fill" is a practical working term for suppressing
reflected fill with a dark surface; this is a project application of fill control,
not a claim the cited pages explicitly teach that named technique.

Avoid fake precision: an untested prompt with a numeric Kelvin value or ratio is
not a measured lighting setup. Descriptive warm-practical/cool-dusk relationships
can be clearer than contradictory equipment specifications.

## Three current packet applications

| Film | Light plan | Critical shadow check |
|---|---|---|
| The Dry Seat | Broad cloudy key from camera-right, gentle shelter fill; dry/wet wood contrast readable | Soft contact shadows and consistent ambient direction; no sudden hard noon shadows in rain |
| Same Old Handshake | Warm workshop window from left, restrained fill; robot eyes secondary accents | Mitt/hand grounded on bench; eye lights do not invent strong competing cast shadows |
| The Last Light | Fixed cool dusk fill plus one center-clamped warm practical moving its pool from robot to plant | New warm shadow/highlight state agrees with lamp direction; no unchanged old pool, duplicate source or eye-light power-off |

For a light-moving plot, generate and review start/end light states separately if
necessary. Cut between them deliberately instead of demanding exact simulated
light transport. Preserve camera and geometry. A magical shadow may disobey
physics **only when that is an explicit story rule**, not an unacknowledged defect.

## Prompt recipe

`motivated source -> direction/height -> softness -> fill/contrast -> essential
readability -> surface response -> expected shadow behavior -> invariant/change`

Example: "One broad overcast daylight source from camera-right, diffused by the
cloudy sky. Retain gentle shelter fill so both eyes and the offered seat are
readable. The coat and bodies cast only soft grounded shadows. Wet wood is darker
than the revealed dry patch; do not make a spotlight appear when the coat lifts.
Keep this light direction through the reaction shot."

This is a full visual intention, not a supported provider-specific `lighting`
API field. Put it in prompt prose unless the live model form exposes a control.

## Reviewer failure conditions and cheapest repair

| Failure | Repair to try before rerendering everything |
|---|---|
| Shadow jumps direction with no source/camera change | Fix the one inconsistent frame/shot; strengthen shared source description/reference |
| Person/prop floats or intersects at contact | Simplify contact, widen grounding view or cut between stable supported states |
| A shadow exposes or hides the reveal incorrectly | Restage key/fill/prop; do not repair the missing clue with music |
| Light flickers or face brightness pumps unintentionally | Lock source state; use a shorter stable segment or new take |
| Glossy metal or eyes create impossible duplicate sources | Simplify surface response, reduce highlights; inspect the actual design |
| Dark mood crushes essential action | Lift justified fill or change background contrast, preserving the intended mood |
| Soft fill creates an unexplained second hard shadow | Broaden/reduce that fill and compare shadow directions |
| Moving lamp leaves old highlights/shadows behind | Render stable end state and use a deliberate motivated cut |

Review adjacent frames, full-speed motion and phone-size display. Automated
schema checks establish only that the plan is explicit; they cannot judge
photometric correctness, believable skin/materials or emotional interpretation.

## Required persistence

`lightingPlan` is required in every production example/packet. It contains
motivation, key/fill, exposure priority, a shadow map, invariants, intentional
changes and review state. The lighting skill and visual reviewer must use it.
The final `lighting-shadow-continuity` review is separate from prose completeness.

# Cinematic motion: discussion before the next build

2026-11-04. Jamie requests discussion before choosing a new rendering method. No new code, media generation, provider connection or production change follows from this note. The local Pilot 1A is unchanged.

## User direction to retain

- Westminster should advance much more quickly toward the bridge, reach a view with the bridge overhead, enter its pedestrian underpass/tunnel, then transition to the next planned place.
- Keep the existing journey order: the next narrative chapter is the One New Change glass lift overlooking St Paul's. The room/monitor remains a later destination and a separate technical proof; do not silently replace the City chapter.
- Full-viewport imagery, including phone art direction. The existing phone prototype's separate upper text region is not the desired final presentation.
- Text belongs beside/within the scene, potentially on a restrained glass panel. It should enter, progress and pass with scrolling, giving a downward page journey instead of persistent text at the top.
- Photographic moving-place realism, convincing human-eye camera travel and natural environmental motion. More shallow lateral movement of the same flat view does not satisfy this target.
- Keep copy as editable semantic HTML, independent of generated imagery/video. Original day/night hero art and identity fidelity remain protected.

## What research establishes

The public [Komputer Mechanic tutorial](https://komputermechanic.com/tutorials/scroll-animation-website) describes a Higgsfield-generated scroll-controlled film with separate HTML headings. Its later full prompts/templates were not accessed; the public setup prompts are reference material, not instructions to run a smoke test or spend credits.

The [BMW reference](https://www.bmwf3.com/) returned no readable rendered page text to the web tool. Read-only inspection of its public HTML and [linked public JavaScript](https://www.bmwf3.com/assets/index-C-EY-SIo.js) found `/hero.mp4`, `/showreel.mp4`, `/figma/scroll-video-1_5s.mp4` and additional media layers. This establishes use of video assets, not the creation provider, a single-video architecture or a verified browser scroll experience. No live browser interaction or remote media download occurred.

[Higgsfield's Seedance guidance](https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-use-seedance) supports reference-led camera-move generation and reviewing a short draft before higher-resolution output. Generated output still needs our own architecture, identity, exposure and paused-frame review; it is not a 99% pixel-preservation guarantee.

## Options, not a chosen architecture

| Option | Where it fits | Main limit to test |
| --- | --- | --- |
| Generated footage, driven by scroll | Large forward moves, bridge underside, interiors and complex real-world detail | Geometry/identity drift, clip continuity, source resolution, seek latency and phone delivery |
| Existing images and layered geometry | Preserving exact source pixels; modest depth and rigid foreground motion | A flat plate cannot reveal accurate hidden bridge geometry during a large move; additional references/modeling are needed |
| Scene-specific mix | Protected original hero layers, film-based travel shots, genuine 3D/HTML monitor interaction | More than one asset pipeline; exposure/style and scroll joins must still feel continuous |

A scene-specific mix is a candidate for discussion, not a decision. Higgsfield would author source footage. Scroll-craft/GSAP and the browser would still own scroll position, loading and readable content; Three.js remains useful where real geometry/interactivity is needed. HyperFrames remains separate authoring/export support, not the site data/form runtime.

## Proposed Westminster shot to discuss

Start on a credible riverside WALKWAY rather than in the middle of the water. Establish Parliament and Big Ben across the Thames with the bridge to the right. Move forward along the bank; nearby pavement/railings and bridge structure provide stronger depth than the distant Palace. As the bridge grows overhead, move into a reference-grounded pedestrian passage with gradual exposure change. Its real near structure/shadow can cover the cinematic location change to the City/lift.

Faster travel means greater movement per scroll distance, not automatic playback after a wheel gesture. Every position still pauses and reverses. Exact viewpoint, safe camera path, overhead/underpass references and start/mid/end frames need agreement before generating a clip. The old opaque grey wall is a technical cover study, not the intended final bridge art.

Content could use one small side/glass panel at a time, clear typography and restrained reflections, entering and passing upward with progress. Protect landmarks and keep the viewport filled by the environment. On 2026-11-04 Jamie chose “Slow travel while reading, faster between panels”. Camera progress remains gentle during each readable panel, then accelerates smoothly as the panel passes upward/out and the journey connects to the next view. This is a scroll-distance mapping, not timed automatic travel; pausing/reversing retains control at every position. Ambient life can continue independently. The rendering/provider decision remains open. This does not require pinning a heading to the top for an entire chapter or burning text into footage.

Suggested next experiment after agreement: ONE short reference-led shot from riverside arrival to bridge-underpass cover, with planned content placement and first/mid/final review frames. Compare it against the current method at paused and reverse positions before choosing the site-wide approach. No generation is authorized by this suggestion.

## Connection and cost facts

Plugin discovery found Higgsfield available but not installed/connected in this chat. No connection suggestion/install flow, credential access or generation was initiated while the provider choice is open.

[Higgsfield's MCP documentation](https://higgsfield.ai/creator-hub/help-center/integrations/what-is-higgsfield-mcp) says MCP generations use credits, including where the website plan offers Unlimited access. The connector automates generation; it does not itself establish higher visual quality. Manual web-generated footage can also be integrated after export. No price, model, budget or spending decision is made here.

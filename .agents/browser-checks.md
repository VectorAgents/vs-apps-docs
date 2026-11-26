# Browser checks

Notes for any walk through a web page with Chrome DevTools. They keep large output out of your context.

- Save a snapshot with `filePath`, then search the file with `rg`. Do not read a whole snapshot.
- Use the snapshot that `wait_for` returns. Do not call `take_snapshot` right after it.
- Filter network listings with `resourceTypes` and `pageSize`.
- Drive the Edge debug browser on port 9222 with the `chrome-devtools-edge` tools, or with `playwright-cli attach --cdp=http://localhost:9222`. The scheme is required: `--cdp=localhost:9222` fails with `Protocol "localhost:" not supported`. Run `playwright-cli detach` when done. Both drive the signed-in tabs, so never `goto` a Space that is not running.
- Prefer `take_snapshot` with `filePath` over `take_screenshot`, which can stall for minutes.
- To open a Radix menu, call `evaluate_script` with a function that dispatches `pointerdown`, `mousedown`, `pointerup`, `mouseup` and `click` on the element, then reads the toast text from `[data-sonner-toast]`.

# Architecture review — ADR-0041 candidate

Reviewed revision: d1439ded21dae079cf20f17c6d2a02622a2390a7.
Reviewer role: coordinator, independent from the A1 authoring worker; read-only pass.

Verdict: changes required.

A1-01 (important): ADR-0041 lines 42–44 relax the static-site restriction for the
Missions demonstration. ADR-0033 D6 keeps Website static without client JavaScript;
the approved surfaces packet Task S4 still requires zero client JavaScript. Missions
is a separate application. This exception is unnecessary and could authorize Website
behavior outside the approved scope. Preserve Website's restriction explicitly and
place the interactive demo in Missions; add a doctrinal counterproof.

The seven supersession groups, boundary-driven layout, two separate authorities,
conditional names, and signed parentless roots otherwise match the approved design.

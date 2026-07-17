# Qualification conservatoire des ressources — Notebook Core v2

> **Statut : preuve historique de rédaction, acceptée comme justification de borne par Gate A ;
> pas approbation Gate B.** Ces mesures utilisent uniquement le golden public. Elles ne qualifient
> ni le moteur expérimental courant, ni l'ABI WIT exécutée par un host, ni un navigateur.

## Méthode

Mesure le 2026-07-16 sur Apple M4 Max, 36 Gio, arm64, macOS 26.5.2, avec un harness Rust release
jetable reproduisant le profil public `Argon2id m=65536,t=3,p=1`, AES-256-GCM, Base64 et JCS. Chaque
ligne est un processus neuf mesuré par `/usr/bin/time -l`; le pic est le `maximum resident set size`.
Le harness n'est pas intégré au candidat : sa réimplémentation et sa revue restent bloquées par Gate A.

| Plaintext one-shot | Seal | Open | Pic RSS seal | Pic RSS open |
| ---: | ---: | ---: | ---: | ---: |
| 1 MiB | 131,2 ms | 129,1 ms | 87,6 MiB | 88,3 MiB |
| 8 MiB | 214,6 ms | 206,9 ms | 145,4 MiB | 161,3 MiB |
| 16 MiB | 305,7 ms | 283,6 ms | 209,4 MiB | 209,1 MiB |
| 32 MiB | 488,0 ms | 445,0 ms | 337,4 MiB | 337,4 MiB |
| 100 MiB | 1,27 s | 1,17 s | 1 081,4 MiB | 1 065,3 MiB |

Les mesures incluent les copies du harness ; elles servent de majorant comparatif, pas de promesse de
production. L'ABI composant et le host navigateur ajouteront encore des copies. L'expérience ne mesure
pas les appareils faibles, les navigateurs, les erreurs d'allocation ou les écarts de temps anti-oracle.

## Décision verrouillée à Gate A

La limite initiale de 100 MiB est refusée : elle dépasse 1 GiB de RSS avant qualification navigateur.
Le candidat v2 est ramené à **16 MiB** de plaintext, **16 777 232 octets** de `C || T`,
**22 369 644 caractères** Base64 et **22 370 044 octets** d'enveloppe JCS maximale. La même borne brute s'applique à l'entrée Context v2, dont les contenus cumulés sont aussi limités à 16 MiB.

Gate A a accepté cette borne dans le contrat v2 verrouillé. Gate B doit encore mesurer le composant
réellement livrable avec son host dans chaque navigateur et classe d'appareil supportés. Dépasser
16 MiB exigerait désormais une nouvelle version de contrat et un futur format chunké, authentifié et
revu séparément ; aucune segmentation implicite n'est admise en v2.

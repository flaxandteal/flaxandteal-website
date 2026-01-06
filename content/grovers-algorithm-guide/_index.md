---
title: "Grover's Algorithm Guide"
slug: "grovers-algorithm-guide"
draft: false
layout: "single"
description: "A step-by-step walkthrough of Grover's quantum search algorithm, including the oracle, diffusion operator, and amplitude amplification schedule."
math: true
---

## Introduction

Grover's algorithm is an algorithm to perform search on an unordered list. Ordered lists can be searched efficiently using [binary search][binary-search], but classically an unordered list requires \(O(N)\) checks. Grover's algorithm reduces this to \(O(\sqrt{N})\) operations—often not enough for quantum advantage, but crucial as an amplitude-amplification subroutine and for its educational simplicity.

**Problem statement**: Given an unordered list of values, return the index (position) of the element that satisfies a criterion (the function to test this criterion is called an oracle).

**Algorithm Outline**: Prepare a superposition over every index and repeatedly apply an operation that amplifies the amplitude of the marked index until it dominates the output, in \(O(\sqrt{N})\) applications.

**Need for an efficient and useful oracle**: The oracle identifies the state of interest. Many toy derivations assume knowledge of the result, but the algorithm also works with a realistic oracle. See [oracle][oracle] for current proposals.

## Algorithm Outline

See the [IBM tutorial](https://quantum.cloud.ibm.com/docs/en/tutorials/grovers-algorithm) for complementary details; this guide focuses on the mathematical derivation of the computational complexity.

We start with the uniform superposition

$$
|s\rangle = \frac{1}{\sqrt{N}}\sum_{x=0}^{N-1}|x\rangle.
$$

Rewrite it using the target state \(|\omega\rangle\) and its orthogonal complement

$$
|\omega_\perp\rangle = \frac{1}{\sqrt{N-1}}\sum_{x\neq \omega}|x\rangle.
$$

Express the amplitudes trigonometrically for later convenience:

$$
|s\rangle = \frac{1}{\sqrt{N}}|\omega\rangle + \frac{\sqrt{N-1}}{\sqrt{N}}|\omega_\perp\rangle = \sin(\theta)|\omega\rangle + \cos(\theta)|\omega_\perp\rangle.
$$

The Grover operator \(G\) is two consecutive Householder reflections: the oracle \(U_\omega\) and the diffusion (inversion-about-the-mean) operator \(U_s\):

$$
U_{\omega}=I-2|\omega\rangle\langle\omega|,\qquad
U_{s}= -(I - 2|s\rangle\langle s|),\qquad
G = U_s\,U_\omega.
$$

Each application of \(G\) amplifies the amplitude of \(|\omega\rangle\) up to an optimal number of iterations derived below.

![Amplitude amplification for a single marked item in a 64-element space](/images/grovers-algorithm-guide/amplitude-amplification.svg)

### Matrix representation of Grover operator

Using Sympy in the basis \(\{|\omega\rangle, |\omega_\perp\rangle\}\):

```python
from sympy import Matrix, symbols, sin, cos, eye

θ = symbols('theta', real=True, positive=True)
ω = Matrix([1, 0])
s = Matrix([sin(θ), cos(θ)])

Uω = eye(2) - 2*(ω * ω.T)
Us = 2*(s * s.T) - eye(2)
```

The diffusion operator simplifies to

$$
U_s = \begin{bmatrix}
-\cos(2\theta) & \sin(2\theta)\\
\sin(2\theta) & \cos(2\theta)
\end{bmatrix},
$$

and the Grover operator

$$
G = \begin{bmatrix}
\cos(2\theta) & \sin(2\theta)\\
-\sin(2\theta) & \cos(2\theta)
\end{bmatrix}.
$$

### Amplitude of our target state after one iteration of the Grover operator

The amplitude of \(|\omega\rangle\) after one Grover iteration starting from \(|s\rangle\) is

$$
\langle \omega | G | s \rangle = \sin(3\theta),
$$

which is larger than the starting amplitude for sufficiently large \(N\) (small \(\theta\)).

### Diagonalization of the Grover operator

Diagonalizing \(G\) makes repeated applications simple. Its eigenvalues in the reordered basis are

$$
\Lambda = \operatorname{diag}(e^{2 i \theta},\, e^{-2 i \theta}),
$$

with change-of-basis matrix

$$
C_m = \begin{bmatrix}
-i & i\\
1 & 1
\end{bmatrix}.
$$

Raising \(G\) to the \(r\)th power amounts to powering the diagonal matrix:

$$
G^r = C_m\,\Lambda^r\,C_m^{-1} = C_m \begin{bmatrix}
e^{2 i r \theta} & 0\\
0 & e^{-2 i r \theta}
\end{bmatrix} C_m^{-1}.
$$

![Rotation of the state vector toward the marked subspace across Grover iterations](/images/grovers-algorithm-guide/state-rotation.svg)

### Complexity of the algorithm and optimal number of iterations

Starting from \(|s\rangle\), after \(r\) Grover iterations the success probability is

$$
p = |\langle \omega | G^r | s \rangle|^2 = \sin^2\bigl(\theta(2r + 1)\bigr).
$$

The optimum occurs when \(\theta(2r + 1) \approx \pi/2\), giving

$$
r \approx \frac{\pi}{4}\sqrt{N} + O(1; N \to \infty),
$$

so the algorithm scales as \(O(\sqrt{N})\). Overshooting the optimum causes the probability to decrease as the rotation continues.

## Notes on the oracle

Many didactic treatments use an oracle that assumes the answer. Practical oracles can be built as quantum lookup tables \(T(i)=x\), but constructing them efficiently is challenging. Recent proposals achieve \(O(\sqrt{N})\) scaling for lookup; see [qLUT][qLUT] and [QRAM][QRAM].

## Sources

- https://arxiv.org/pdf/quant-ph/9605043 — original paper  
- https://arxiv.org/pdf/quant-ph/9605034 — proves it cannot be done faster than \(O(\sqrt{N})\)  
- https://arxiv.org/pdf/quant-ph/9711070 — proves it cannot be parallelised faster  
- https://github.com/Qiskit/textbook/blob/main/notebooks/ch-algorithms/grover.ipynb — comprehensive notebook using Qiskit  
- https://en.wikipedia.org/wiki/Amplitude_amplification — reference for amplitude amplification  
- https://en.wikipedia.org/wiki/Grover%27s_algorithm — background material  
- https://www.cs.cmu.edu/~odonnell/quantum15/lecture04.pdf — detailed lecture notes  
- https://arxiv.org/pdf/1812.00954 — first \(O(\sqrt{N})\) oracle  
- https://arxiv.org/abs/2408.16794 — state-of-the-art oracle

[binary-search]: https://en.wikipedia.org/wiki/Binary_search
[qa-paper]: https://arxiv.org/pdf/2307.00523
[amp]: https://en.wikipedia.org/wiki/Amplitude_amplification
[oracle]: https://arxiv.org/abs/2408.16794
[qLUT]: https://arxiv.org/pdf/1812.00954
[QRAM]: https://arxiv.org/abs/2408.16794

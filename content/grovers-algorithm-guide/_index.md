---
title: "Grover's Algorithm Guide"
slug: "grovers-algorithm-guide"
draft: false
layout: "single"
description: "A step-by-step walkthrough of Grover's quantum search algorithm, including the oracle, diffusion operator, and amplitude amplification schedule."
math: true
---

## Introduction

Grover's algorithm is an algorithm to perform search on an unordered list. Ordered lists can be searched very efficiently using [binary search][binary-search], which is analogous to how you search a book in a library. Classically, to search an unordered list you have to check every single entry so the complexity is \(O(N)\). Grover's algorithm allows us to do this using \(O(\sqrt{N})\) operations which is a huge speed up but probably not [enough][qa-paper] for quantum advantage. However Grover's Algorithm is important as a subroutine of other quantum algorithms as well for its educational value partly due to its simplicity.

The algorithm is an example of [amplitude amplification][amp].

**Problem statement**

Given an unordered list of values return the index (position) of the element of the list that satisfies a criterion (the function to test this criterion is called an oracle).

**Algorithm Outline**

The basic idea is that we prepare a state that is a superposition of every single potential index, and we apply an operation that amplifies the relative amplitude of the index until it dominates the output in a number of applications that is \(O(\sqrt{N})\).

**Need for an efficient and useful Oracle**

An Oracle is just a function that can identify the state we are interested in. In the derivation below used in all of the sources, the toy Oracle require knowledge of the result, but this is not needed, and the algorithm works with a useful [oracle][oracle]

## Algorithm Outline

See this [reference](https://quantum.cloud.ibm.com/docs/en/tutorials/grovers-algorithm) for a thorough and complementary explanation. This post will focus on the mathematical derivation of the computational complexity.

We will start by creating a superposition \(|x\rangle\) of every possible index \(|x\rangle\)

$$
{|s\rangle ={\frac {1}{\sqrt {N}}}\sum_{x=0}^{N-1}|x\rangle}
$$

This can be rewritten in terms of our target state \(|\omega\rangle\) (to be found by the algorithm), and \(\textstyle |\omega_\perp\rangle ={\frac {1}{\sqrt {N-1}}}\sum_{x\neq \omega}|x\rangle\) which represents all of the other indices.

We rewrite the amplitudes in terms of trigonometric functions which will come in handy later.

$$
|s\rangle ={\frac {1}{\sqrt {N}}}\sum _{x=0}^{N-1}|x\rangle =
{\frac {1}{\sqrt {N}}} |\omega\rangle + {\frac {\sqrt {N-1}}{\sqrt {N}}} |\omega_\perp\rangle =
\sin(\theta) |\omega\rangle + \cos(\theta) |\omega_\perp\rangle
$$

The Grover operator \(G\) is made up of two consecutive Householder reflections the first one implements the oracle \(U_\omega\) and the second one (with a minus sign) flips around the mean

$$U_{\omega }=I-2|\omega \rangle \langle \omega |$$
$$U_{s}= -(I - 2|s\rangle \langle s|)$$
$$G = U_s \cdot U_\omega$$

Every application of the Grover operator amplifies the relative amplitude of \(|\omega \rangle\) in the result up to an optimal number of times we compute below.

### Matrix representation of Grover operator

We can use sympy to manipulate and simplify the matrices symbolically in the basis of \(|\omega\rangle\) and \(|\omega_\perp\rangle\)

```python
from sympy import (
    Matrix, symbols, sin, cos, eye, diag, powdenest,
    simplify, expand_power_base, conjugate, expand, exp, sqrt, I
)
```

```python
# symbols and parameters
θ, r, N = symbols('theta r N', real=True, positive=True)

# vectors ω and s in the {|ω>, |ω⟂>} basis
ω = Matrix([1, 0])
s = Matrix([sin(θ), cos(θ)])
```

```python
# reflection-like matrices Uω and Us
Uω = eye(2) - 2*(ω * ω.T)

Us = 2*(s * s.T) - eye(2)
Us = simplify(Us)
Us
```

$$
\begin{bmatrix}- \cos{\left(2 \theta \right)} & \sin{\left(2 \theta \right)}\\\sin{\left(2 \theta \right)} & \cos{\left(2 \theta \right)}\end{bmatrix}
$$

```python
G = Us * Uω
G
```

$$
\begin{bmatrix}\cos{\left(2 \theta \right)} & \sin{\left(2 \theta \right)}\\- \sin{\left(2 \theta \right)} & \cos{\left(2 \theta \right)}\end{bmatrix}
$$

The composition of two reflections is a rotation matrix, so in a way, this matrix has all the information we need about the Grover algorithm. We must rotate enough times to get as close to \(|\omega\rangle\) as possible.

### Amplitude of our target state after one iteration of the Grover operator

The amplitude of state \(|\omega\rangle\), after applying the Grover operator G once, starting from the state \(|s\rangle\) is

$$
\langle \omega | G | s \rangle
$$

```python
expr = (ω.T * G * s)
expr.simplify()
```

$$
\begin{bmatrix}\sin{\left(3 \theta \right)}\end{bmatrix}
$$

Which is the original angle plus the rotation: \(\theta + 2 \theta\).
Furthermore it is larger than the original amplitude for small enough \(\theta\) (large enough \(N\)). Grover's amplitude consists of an optimal number of applications of Grover's operator. Which, as we shall see, is smaller than the classical complexity \(N\).

### Diagonalization of the Grover operator

As we wish to repeatedly apply \(G\), it will be convenient to diagonalise it, as matrix powers are particularly simple for diagonal matrices.

```python
# eigenvalues and eigenvectors (Eigensystem)
eigs = G.eigenvects()   # list of (eigenvalue, multiplicity, [eigenvectors])
ls = [ev[0] for ev in eigs]
vs = [ev[2][0] for ev in eigs]  # pick one eigenvector per eigenvalue
```

The radicals appear as complex conjugates but sympy refuses to simplify it so we choose the positive root for all cases

```python
expand(ls[0])
```

$$
- \sqrt{\cos^{2}{\left(2 \theta \right)} - 1} + \cos{\left(2 \theta \right)}
$$

```python
expand(vs[1])
```

$$
\begin{bmatrix}\frac{\sin{\left(2 \theta \right)}}{\sqrt{\cos^{2}{\left(2 \theta \right)} - 1}}\\1\end{bmatrix}
$$

```python
rep = (sqrt(cos(2*θ)**2-1), I*sin(2*θ))
```

We also reorder them so the one with the positive exponent sits at the top.

```python
ls = [expand(l).subs(*rep).rewrite(exp) for l in ls][::-1]
diag(*ls)
```

$$
\begin{bmatrix}e^{2 i \theta} & 0\\0 & e^{- 2 i \theta}\end{bmatrix}
$$

```python
vs = [expand(v).subs(*rep) for v in vs][::-1]
Cm = Matrix.hstack(*vs)
Cm
```

$$
\begin{bmatrix}- i & i\\1 & 1\end{bmatrix}
$$

Check we recover the diagonal matrix when changing basis

```python
(Cm.inv() * G * Cm).rewrite(exp).simplify()
```

$$
\begin{bmatrix}e^{2 i \theta} & 0\\0 & e^{- 2 i \theta}\end{bmatrix}
$$

Repeated application of the Grover operator amounts to taking the power of the matrix which looks particularly simple in the diagonal basis

```python
# diagonal matrix of eigenvalues^r
Lr = powdenest(diag(*ls)**r, force=True)
Lr
```

$$
\begin{bmatrix}e^{2 i r \theta} & 0\\0 & e^{- 2 i r \theta}\end{bmatrix}
$$

### Complexity of the algorithm and optimal number of iterations

Using trigonometric functions makes a key feature of amplitude amplification evident. Because \(\sin\) is a periodic function, there will be an optimal number of applications of \(G\) after which the target amplitude will start decreasing again. We wish to maximise the probability of finding our result in state \(|\omega\rangle\), after applying the Grover operator G r times, starting from the state \(|s\rangle\).

$$
p = |\langle \omega | G^r | s \rangle|^2 = |\langle \omega | C_m L^r C_m^{-1} | s \rangle|^2
$$

```python
amp = (ω.T * Cm * Lr * Cm.inv() * s)
amp = amp.rewrite(exp).simplify()
p = amp**2
p
```

$$
\begin{bmatrix}\sin^{2}{\left(\theta \left(2 r + 1\right) \right)}\end{bmatrix}
$$

So the optimal number of iterations occurs when

$$\theta (2r+1) \approx \pi / 2$$

```python
from sympy import solve, Eq, pi, asin, series, oo

sol = solve(Eq(θ*(2*r+1), pi/2), r)[0]

res = sol.replace(θ, asin(1/sqrt(N)))

N = symbols('N', real=True, positive=True)

series(res, N, oo, 0)
```

$$
\frac{\pi \sqrt{N}}{4} + O\left(1; N\rightarrow \infty\right)
$$

For large \(N\) the result scales as \(O(\sqrt{N})\). Although it is non-trivial to see that we cannot do better than this, the simplicity of this result provides some intuition, as the only dependance on \(N\) comes from \(\arcsin(1/\sqrt{N}) = O(1/\sqrt{N})\), for large \(N\).

## Notes on the oracle

Although most of the original sources and didactic material use an oracle that implicitly or explicitly assume knowledge of the answer. Practical realistic oracles involve a quantum look-up-table (qLUT) \(T\) that maps an index \(i\) to a value \(T(i) = x\). Constructing an efficient oracle is the trickiest part of the algorithm, it seems that only recently have there been proposals [here][qLUT], and [here][QRAM] where the lookup scales as \(O(\sqrt{N})\).

## Sources

- https://arxiv.org/pdf/quant-ph/9605043 : original paper
- https://arxiv.org/pdf/quant-ph/9605034 : proves that it cannot be done faster than \(O(\sqrt{N})\)
- https://arxiv.org/pdf/quant-ph/9711070 : proves it cannot be done in parallel
- https://github.com/Qiskit/textbook/blob/main/notebooks/ch-algorithms/grover.ipynb: very comprehensive notebook using Qiskit
- https://en.wikipedia.org/wiki/Amplitude_amplification : mostly complete but had typos and missing details
- https://en.wikipedia.org/wiki/Grover%27s_algorithm : for completeness refer to the one above
- https://www.cs.cmu.edu/~odonnell/quantum15/lecture04.pdf : very detailed but I think the derivation here is more intuitive if one knows basic linear algebra
- https://arxiv.org/pdf/1812.00954 : first \(O(\sqrt{N})\) oracle
- https://arxiv.org/abs/2408.16794 : state of the art oracle

[binary-search]: https://en.wikipedia.org/wiki/Binary_search
[qa-paper]: https://arxiv.org/pdf/2307.00523
[amp]: https://en.wikipedia.org/wiki/Amplitude_amplification
[oracle]: https://arxiv.org/abs/2408.16794
[qLUT]: https://arxiv.org/pdf/1812.00954
[QRAM]: https://arxiv.org/abs/2408.16794

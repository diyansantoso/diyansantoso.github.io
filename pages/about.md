---
layout: page
title: About
permalink: /about/
weight: 3
---

# **About Me**

Hi I am **{{ site.author.name }}** :wave:,<br>
I'm Front End Developer, Wordpress, Blogger

<div class="row">
{% include about/skills.html title="Programming Skills" source=site.data.programming-skills %}
{% include about/skills.html title="Other Skills" source=site.data.other-skills %}
</div>

<div class="row">
{% include about/timeline.html %}
</div>

<br>
<br>

Download CV 
[Indonesia](assets/pdf/CV-ID.pdf)
[English](assets/pdf/CV-EN.pdf)

Lihat
Indonesia English
<embed src="/assets/pdf/CV-ID.pdf" width="100%" height="600px" />

<iframe src="/assets/pdf/CV-ID.pdf" width="100%" height="600px">
    <p>Browser Anda tidak mendukung iframe, silakan <a href="/assets/pdf/CV-ID.pdf">unduh PDF</a>.</p>
</iframe>



<iframe src="{{ '/assets/pdf/CV-ID.pdf' | relative_url }}" width="100%" height="600px">
    <p>Browser Anda tidak mendukung iframe, silakan <a href="{{ '/assets/pdf/CV-ID.pdf' | relative_url }}">unduh PDF</a>.</p>
</iframe>
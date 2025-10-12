---
title: Install Jekyll di Ubuntu
date: 2020-01-01 16:00:00 +1000
categories: [Jekyll]
tags: [jekyll]     # TAG names should always be lowercase
---


### Requirements :
```bash
sudo apt-get install ruby-full build-essential zlib1g-dev 
```
###### Set up a gem installation directory for
your user account :

```bash
bash echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc echo 'export GEM_HOME="$HOME/gems"' >>
~/.bashrc echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashr source ~/.bashrc 
```

### install Jekyll and Bundler: 
```bash
bash gem install jekyll bundler 
```

### Mulai mengunakan Jekyll
```bash
gem install jekyll bundlergem install jekyll bundler
gem install bundler jekyll
jekyll new cv
cd cv/
bundle exec jekyll serve
```

### Mengunakan Template

1. Clone repository tempalate
```bash
clone link_template
```
2. Download di lokal komputer
```bash
wget link_template
```

3. Extrak Template
```bash
cd template
bundle install 
bundle exec jekyll serve 
```
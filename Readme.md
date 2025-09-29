# Jekyll on Ubuntu:
Requirements Install :
```bash
sudo apt-get install ruby-full build-essential zlib1g-dev
```
Set up a gem installation directory for your user account :
```bash
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashr
source ~/.bashrc
```

Finally, install Jekyll and Bundler:
```bash
gem install jekyll bundler
```


### Install mengunakan jekyll :
```bash
gem install jekyll bundler
gem install bundler jekyll
jekyll new cv
cd cv/
bundle exec jekyll serve
```

### Install tema portfolYOU:
clone repository [portfolYOU](https://yousinix.github.io/portfolYOU/)
```bash
wget https://github.com/yousinix/portfolYOU/archive/refs/heads/master.zip
unzip master.zip
cd portfolYOU
bundle install
bundle exec jekyll serve
```

Read [this](https://yousinix.github.io/portfolYOU/docs/) for detail 


### Reference :
[Jekyll](https://jekyllrb.com/)
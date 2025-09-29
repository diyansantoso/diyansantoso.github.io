Persiapan:
Untuk di Linux 
sudo apt-get install ruby-full build-essential zlib1g-dev

jalankan:
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

lalu:
gem install jekyll bundler



Install mengunakan jekyll :
gem install jekyll bundler
gem install bundler jekyll
jekyll new cv
cd cv/
bundle exec jekyll serve


Mengunakan Tema yang sudah ada :
open folder tempalte (khususnya di template ini)
bundle install
bundle exec jekyll serve

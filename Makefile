HUGO_VERSION := 0.125.7
HUGO_IMAGE   := hugomods/hugo:exts-$(HUGO_VERSION)
DOCKER       := docker run --rm -v "$(PWD):/src" -w /src

.PHONY: serve build clean

serve:
	$(DOCKER) -p 1313:1313 $(HUGO_IMAGE) hugo server --bind 0.0.0.0

build:
	$(DOCKER) $(HUGO_IMAGE) hugo --minify

clean:
	rm -rf docs/

BUNDLES = \
  android node python ruby golang php \
  postgres mysql mongo elixir \
  clojure openjdk buildpack-deps

images: $(foreach b, $(BUNDLES), $(b)/generate_images)

publish_images: images
	find . -name Dockerfile -exec ./shared/images/build.sh {} \;

%/generate_images:
	cd $(@D) && ./generate-images

%/publish_images: %/generate_images
	find ./$(@D) -name Dockerfile | sort | xargs -n 1 ./shared/images/build.sh

%/clean:
	cd $(@D) ; rm -r images || true

clean: $(foreach b, $(BUNDLES), $(b)/clean)

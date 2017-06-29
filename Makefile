BUNDLES = \
  android node python ruby golang php \
  postgres mysql mongo elixir \
  clojure openjdk

images: $(foreach b, $(BUNDLES), $(b)/generate_images)

publish_images: images
	find . -name Dockerfile -exec ./shared/images/build.sh {} \;

%/generate_images:
	cd $(@D) && ./generate-images

%/build_image:
	echo $(@D)

%/publish_image:
	echo $(@D)

%/clean:
	cd $(@D) ; rm -r images || true

clean: $(foreach b, $(BUNDLES), $(b)/clean)

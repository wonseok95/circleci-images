BUNDLES = \
  node python ruby golang \
  postgres mysql mongo elixir

images: $(foreach b, $(BUNDLES), $(b)/generate_images)

publish_images: images
	find . -name Dockerfile -exec ./shared/images/build.sh {} \;

%/generate_images:
	cd $(@D); ./generate-images

%/build_image:
	echo $(@D)

%/publish_image:
	echo $(@D)

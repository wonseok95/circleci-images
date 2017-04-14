BUNDLES = \
  node python ruby golang \
  postgres mysql mongo elixir

images: $(foreach b, $(BUNDLES), $(b)/generate_images)

publish_images: images
	find . -name Dockerfile -exec ./shared/images/build.sh {} \;

%/generate_images:
	cd $(@D); source ./generate-images; source ../shared/images/generate.sh

%/build_image:
	echo $(@D)

%/publish_image:
	echo $(@D)

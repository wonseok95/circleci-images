BUNDLES = \
  node python ruby golang php \
  postgres mysql mongo elixir \
  clojure openjdk

images: $(foreach b, $(BUNDLES), $(b)/generate_images) generate_android

publish_images: images
	find . -name Dockerfile -exec ./shared/images/build.sh {} \;

%/generate_images:
	cd $(@D); bash -c 'source ./generate-images; source ../shared/images/generate.sh'

%/build_image:
	echo $(@D)

%/publish_image:
	echo $(@D)

generate_android:
	cd android; bash generate-images

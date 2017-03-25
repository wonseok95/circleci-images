BUNDLES = node python ruby postgres mysql mongo

images: $(foreach b, $(BUNDLES), $(b)/generate_images)

publish_images: $(foreach b, $(BUNDLES), $(b)/publish_images)

%/generate_images:
	cd $(@D); ./generate-images

%/publish_images:
	cd $(@D); ./generate-images publish



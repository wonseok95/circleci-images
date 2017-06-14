FROM openjdk:8-jdk

# Initial Command run as `root`.

ADD bin/circle-android /bin/circle-android

# Skip the first line of the Dockerfile template (FROM ${BASE})
syscmd(`tail -n +2 ../shared/images/Dockerfile-basic.template')

# Now command run as `circle`

ARG sdk_version=sdk-tools-linux-3859397.zip
ARG android_home=/opt/android/sdk

# SHA-256 444e22ce8ca0f67353bda4b85175ed3731cae3ffa695ca18119cbacef1c1bea0

RUN sudo apt-get update && \
    sudo apt-get install --yes xvfb gcc-multilib lib32z1 lib32stdc++6

# Download and install Android SDK
RUN sudo mkdir -p ${android_home} && \
    sudo chown -R circleci:circleci ${android_home} && \
    curl --output /tmp/${sdk_version} https://dl.google.com/android/repository/${sdk_version} && \
    unzip -q /tmp/${sdk_version} -d ${android_home} && \
    rm /tmp/${sdk_version}

# Set environmental variables
ENV ANDROID_HOME ${android_home}
ENV ADB_INSTALL_TIMEOUT 120
ENV PATH=${ANDROID_HOME}/emulator:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools:${PATH}

RUN mkdir ~/.android && echo '### User Sources for Android SDK Manager' > ~/.android/repositories.cfg

RUN sdkmanager --update && yes | sdkmanager --licenses

# Update SDK manager and install system image, platform and build tools
RUN echo y | sdkmanager "tools"
RUN echo y | sdkmanager "platform-tools"
RUN echo y | sdkmanager "extras;android;m2repository"
RUN echo y | sdkmanager "extras;google;m2repository"
RUN echo y | sdkmanager "extras;google;google_play_services"
RUN echo y | sdkmanager "emulator"
RUN echo y | sdkmanager "build-tools;25.0.3"

RUN echo y | sdkmanager "platforms;android-23"
RUN echo y | sdkmanager "system-images;android-23;google_apis;armeabi-v7a"

RUN echo y | sdkmanager "platforms;android-24"
RUN echo y | sdkmanager "system-images;android-24;google_apis;armeabi-v7a"

RUN echo y | sdkmanager "platforms;android-25"
RUN echo y | sdkmanager "system-images;android-25;google_apis;armeabi-v7a"

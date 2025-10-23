import { ShaderMaterial,PlaneGeometry,Mesh ,TextureLoader,Vector2} from "three";
import vertexShader from "../shader/vertex.glsl?raw";
import fragmentShader from "../shader/fragment.glsl?raw";

import { gsap } from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';

  gsap.registerPlugin(ScrollTrigger)


export default class Model {
  constructor(stage) {
    this.stage = stage;
    this.geometry;
    this.material;
    this.mesh;
    this.loader = new TextureLoader();
    
    // 图片配置数组 - 支持任意数量的图片
    this.imageConfigs = [
      { id: 'img01', path: './img01.jpg', greyPath: './grey01.jpg', videoPath: './webm/1.webm' },
      { id: 'img02', path: './img02.jpg', greyPath: './grey02.jpg', videoPath: './webm/2.webm' },
      { id: 'img03', path: './img03.jpg', greyPath: './grey03.jpg', videoPath: './webm/3.webm' },
      { id: 'img04', path: './img04.jpg', greyPath: './grey04.jpg', videoPath: './webm/4.webm' },
      { id: 'img05', path: './img05.jpg', greyPath: './grey05.jpg', videoPath: './webm/5.webm' },
      { id: 'img06', path: './img06.jpg', greyPath: './grey06.jpg', videoPath: './webm/6.webm' }
    ];

    // 动态加载的纹理缓存
    this.textures = {};
    this.greyTextures = {};
    
    // 视频控制相关
    this.videos = {}; // 存储视频元素
    this.videoProgress = {}; // 存储播放进度
    this.videoTimers = {}; // 存储延迟播放定时器
    this.activeVideoId = null;

    // 当前状态
    this.currentImageIndex = 0;
    this.previousImageIndex = 0;
    this.activeSectionIndex = 0;
    this.currentDisplacement = null;
    this.globalScrollStartHandler = null;
    this.globalScrollEndHandler = null;
    this.isScrolling = false;
    this.sectionTriggers = [];
    this.transitionTriggers = [];
    this.blurTriggers = [];
    this.activeTransitionIndex = null;

    this.mouse = new Vector2(0.0,0.0);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.cssVariableRoot = typeof document !== 'undefined' ? document.documentElement : null;
    this.defaultImageAspect = 3 / 2;
  }

  _init() {
    this.createMesh();
    this.initVideos(); // 初始化视频系统
    this.registerGlobalScrollEvents(); // 全局滚动开始/结束监听
    this.setupScrollTriggers();
    this.updateMediaBounds();
  }

  createMesh() {
    const size = {
      x:2,
      y:2,
    }

    const ts = `?v=${Date.now()}`; // 开发期防缓存
    
    // 动态加载所有图片和灰度图
    this.imageConfigs.forEach((config, index) => {
      this.textures[config.id] = this.loader.load(`${config.path}${ts}`);
      this.greyTextures[config.id] = this.loader.load(`${config.greyPath}${ts}`);
      
    });

    // 默认使用第一张图片的灰度图作为初始置换贴图
    this.currentDisplacement = this.greyTextures['img01'];
    this.disp = this.currentDisplacement;
    
    // 创建纹理数组 - 确保纹理已加载
    const textureArray = [
      this.textures['img01'],
      this.textures['img02'],
      this.textures['img03'],
      this.textures['img04'],
      this.textures['img05'],
      this.textures['img06']
    ];
    
    
    
    const uniforms = {
      uResolution: {
        value: new Vector2(this.width,this.height),
      },
      uImageResolution: {
        value: new Vector2(this.getAssetAspect(0), 1),
      },
      // 纹理数组 - 支持6张图片
      uTextures: {
        value: textureArray
      },
      // 当前图片索引
      uCurrentIndex: {
        value: 0
      },
      uTargetIndex: {
        value: 0
      },
      // 过渡进度 (0.0 - 1.0)
      uTransition: {
        value: 0.0
      },
      disp: { 
        value: this.disp //noise-map
      },
      uTime:{
        value:0.0
      },
      uAmplitude:{
        value:1.0
      },
      uBounce:{
        value:new Vector2(0.0,0.0)
      }
    }
    
    this.geometry = new PlaneGeometry(size.x,size.y,100,100);
    this.material = new ShaderMaterial({
      uniforms:uniforms,
      vertexShader: vertexShader,
      fragmentShader:fragmentShader
    });
    this.mesh = new Mesh(this.geometry,this.material);
    this.stage.scene.add(this.mesh);


  }

  // 智能选择置换贴图的方法
  // 规则：根据滚动方向和当前屏索引，选择正确的灰度图
  selectDisplacementTexture(index) {
    const targetConfig = this.imageConfigs[index];
    const greyTexture = this.greyTextures[targetConfig.id];

    if (greyTexture && this.mesh && this.mesh.material) {
      this.currentDisplacement = greyTexture;
      this.mesh.material.uniforms.disp.value = greyTexture;
    }
  }

  // 更新当前图片索引
  updateCurrentImageIndex(index) {
    this.previousImageIndex = this.currentImageIndex;
    this.currentImageIndex = index;
  }

  registerGlobalScrollEvents() {
    if (!this.globalScrollStartHandler) {
      this.globalScrollStartHandler = () => this.handleScrollStart();
      ScrollTrigger.addEventListener('scrollStart', this.globalScrollStartHandler);
    }

    if (!this.globalScrollEndHandler) {
      this.globalScrollEndHandler = () => this.handleScrollEnd();
      ScrollTrigger.addEventListener('scrollEnd', this.globalScrollEndHandler);
    }
  }

  handleScrollStart() {
    this.isScrolling = true;
    this.cancelAllVideoTimers();
    this.stopAllVideos();
  }

  handleScrollEnd() {
    this.isScrolling = false;
    const closestIndex = this.findClosestSectionToCenter();
    this.setActiveSection(closestIndex);
    this.stopVideosExcept(closestIndex);
    this.cancelVideoTimersExcept(closestIndex);
    this.requestVideoPlayIfInRange(closestIndex);
    this.updateAllSubtitleBlur();
    this.updateMediaBounds(closestIndex);
  }

  setupScrollTriggers() {
    this.sectionTriggers.forEach(trigger => trigger.kill());
    this.transitionTriggers.forEach(trigger => trigger.kill());
    this.blurTriggers.forEach(trigger => trigger.kill());
    this.sectionTriggers = [];
    this.transitionTriggers = [];
    this.blurTriggers = [];

    this.imageConfigs.forEach((config, index) => {
      const sectionId = `#sec${String(index + 1).padStart(2, '0')}`;

      const sectionTrigger = ScrollTrigger.create({
        trigger: sectionId,
        start: "top top",
        end: "bottom top",
        onEnter: () => {
          this.handleSectionEnter(index);
        },
        onEnterBack: () => {
          this.handleSectionEnter(index);
        },
        onLeave: () => {
          this.handleSectionLeave(index);
        },
        onLeaveBack: () => {
          this.handleSectionLeave(index);
        },
        invalidateOnRefresh: true
      });
      this.sectionTriggers.push(sectionTrigger);

      const blurTrigger = ScrollTrigger.create({
        trigger: sectionId,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: () => {
          this.updateSubtitleBlur(index);
        },
        invalidateOnRefresh: true
      });
      this.blurTriggers.push(blurTrigger);

      this.updateSubtitleBlur(index);

      if (index > 0) {
        const prevSectionId = `#sec${String(index).padStart(2, '0')}`;
        const prevText = document.querySelector(`${prevSectionId} h2`);
        const nextText = document.querySelector(`${sectionId} h2`);
        if (!prevText || !nextText) {
          return;
        }

        const transitionTrigger = ScrollTrigger.create({
          trigger: prevText,
          start: "center 40%",
          endTrigger: nextText,
          end: "center 60%",
          scrub: true,
          onUpdate: (self) => {
            this.applyScrollTransition(index - 1, index, self.progress, self.direction || 1);
          },
          onToggle: (self) => {
            if (!self.isActive) {
              const dir = self.direction || (self.progress >= 0.5 ? 1 : -1);
              const finalProgress = self.progress >= 0.5 ? 1 : 0;
              this.applyScrollTransition(index - 1, index, finalProgress, dir);
            }
          },
          invalidateOnRefresh: true
        });
        this.transitionTriggers.push(transitionTrigger);
        this.applyScrollTransition(index - 1, index, transitionTrigger.progress || 0);
      }
    });

    ScrollTrigger.refresh();
    this.syncActiveSectionOnInit();
    this.updateAllSubtitleBlur();
  }

  syncActiveSectionOnInit() {
    const closestIndex = this.findClosestSectionToCenter();
    this.setActiveSection(closestIndex);
  }

  findClosestSectionToCenter() {
    const viewportCenter = window.innerHeight / 2;
    let closestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    this.imageConfigs.forEach((_, index) => {
      const { textElement, section } = this.getSectionElements(index);
      const targetElement = textElement || section;
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - viewportCenter);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }

  setActiveSection(index) {
    const maxIndex = this.imageConfigs.length - 1;
    const clampedIndex = Math.min(Math.max(index, 0), maxIndex);

    this.activeSectionIndex = clampedIndex;
    this.currentImageIndex = clampedIndex;
    this.previousImageIndex = Math.max(clampedIndex - 1, 0);
    this.selectDisplacementTexture(clampedIndex);
    this.activeTransitionIndex = null;

    if (this.mesh && this.mesh.material) {
      const uniforms = this.mesh.material.uniforms;
      uniforms.uCurrentIndex.value = clampedIndex;
      if (uniforms.uTargetIndex) {
        uniforms.uTargetIndex.value = clampedIndex;
      }
      uniforms.uTransition.value = 0;
      if (uniforms.uImageResolution && uniforms.uImageResolution.value && typeof uniforms.uImageResolution.value.set === 'function') {
        const aspect = this.getAssetAspect(clampedIndex);
        uniforms.uImageResolution.value.set(aspect, 1);
      }
    }

    this.updateMediaBounds(clampedIndex);
  }

  getDisplayedIndex() {
    if (typeof this.currentImageIndex !== 'number') {
      return 0;
    }
    const maxIndex = this.imageConfigs.length - 1;
    return Math.min(Math.max(this.currentImageIndex, 0), maxIndex);
  }

  handleSectionEnter(index) {
    this.activeSectionIndex = index;
    this.stopVideosExcept(index);
    this.cancelVideoTimersExcept(index);
    this.cancelVideoTimer(this.imageConfigs[index].id);
    this.hideVideoAndShowStillFrame(this.imageConfigs[index].id);
    this.updateSubtitleBlur(index);
    this.updateMediaBounds(index);
  }

  handleSectionLeave(index) {
    const config = this.imageConfigs[index];
    this.cancelVideoTimer(config.id);
    this.stopVideo(config.id);
    this.updateSubtitleBlur(index);
  }

  applyScrollTransition(fromIndex, toIndex, rawProgress, direction = 1) {
    if (!this.mesh || !this.mesh.material) return;

    const uniforms = this.mesh.material.uniforms;
    const maxIndex = this.imageConfigs.length - 1;
    const clampedFrom = Math.min(Math.max(fromIndex, 0), maxIndex);
    const clampedTo = Math.min(Math.max(toIndex, 0), maxIndex);
    const isReverse = direction < 0;
    const startIndex = isReverse ? clampedTo : clampedFrom;
    const targetIndex = isReverse ? clampedFrom : clampedTo;
    const startConfig = this.imageConfigs[startIndex];
    const targetConfig = this.imageConfigs[targetIndex];
    const progress = isReverse ? 1 - rawProgress : rawProgress;

    if (progress <= 0) {
      uniforms.uCurrentIndex.value = startIndex;
      if (uniforms.uTargetIndex) {
        uniforms.uTargetIndex.value = startIndex;
      }
      uniforms.uTransition.value = 0;
      this.previousImageIndex = Math.max(startIndex - 1, 0);
      this.currentImageIndex = startIndex;
      this.selectDisplacementTexture(startIndex);
      this.activeTransitionIndex = null;
      this.cancelVideoTimersExcept(startIndex);
      this.stopVideosExcept(startIndex);
      return;
    }

    if (progress >= 1) {
      uniforms.uCurrentIndex.value = targetIndex;
      if (uniforms.uTargetIndex) {
        uniforms.uTargetIndex.value = targetIndex;
      }
      uniforms.uTransition.value = 0;
      this.previousImageIndex = Math.max(targetIndex - 1, 0);
      this.currentImageIndex = targetIndex;
      this.selectDisplacementTexture(targetIndex);
      this.activeTransitionIndex = null;
      if (startConfig) {
        this.cancelVideoTimer(startConfig.id);
        this.stopVideo(startConfig.id);
      }
      this.cancelVideoTimersExcept(targetIndex);
      this.stopVideosExcept(targetIndex);
      return;
    }

    uniforms.uCurrentIndex.value = startIndex;
    if (uniforms.uTargetIndex) {
      uniforms.uTargetIndex.value = targetIndex;
    }
    uniforms.uTransition.value = progress;
    this.currentImageIndex = progress >= 0.5 ? targetIndex : startIndex;
    this.previousImageIndex = progress >= 0.5 ? startIndex : Math.max(startIndex - 1, 0);
    this.selectDisplacementTexture(targetIndex);

    if (progress >= 0.5) {
      if (startConfig) {
        this.cancelVideoTimer(startConfig.id);
        this.stopVideo(startConfig.id);
      }
    } else {
      if (targetConfig) {
        this.cancelVideoTimer(targetConfig.id);
        this.stopVideo(targetConfig.id);
      }
    }

    this.activeTransitionIndex = targetIndex;
  }

  onLoop() {
    this.mesh.material.uniforms.uTime.value += 0.001;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mesh.material.uniforms.uResolution.value.set(this.width,this.height);
    this.updateAllSubtitleBlur();
    this.updateMediaBounds();
  }

  // ==================== 视频控制方法 ====================

  /**
   * 初始化视频系统
   * 为每个 section 创建对应的视频元素
   */
  initVideos() {
    this.imageConfigs.forEach((config) => {
      this.createVideoElement(config);
      this.videoProgress[config.id] = 0;
    });
  }

  /**
   * 创建视频元素
   * @param {Object} config - 配置对象
   */
  createVideoElement(config) {
    const video = document.createElement('video');
    video.src = config.videoPath;
    video.className = 'video-overlay';
    video.muted = true;
    video.loop = false;
    video.preload = 'metadata';
    video.style.display = 'none';

    document.body.appendChild(video);
    this.videos[config.id] = video;
    this.setupVideoEvents(video, config.id);
  }

  /**
   * 注册视频事件
   */
  setupVideoEvents(video, videoId) {
    video.addEventListener('loadedmetadata', () => {
      console.log(`视频 ${videoId} 元数据加载完成`);
    });

    video.addEventListener('timeupdate', () => {
      this.videoProgress[videoId] = video.currentTime;
    });

    video.addEventListener('ended', () => {
      this.hideVideoAndShowStillFrame(videoId);
      if (this.activeVideoId === videoId) {
        this.activeVideoId = null;
      }
    });
  }

  /**
   * 当滚动停止时，根据字幕位置决定是否播放视频
   */
  requestVideoPlayIfInRange(index) {
    const config = this.imageConfigs[index];
    if (!config) return;

    const { textElement } = this.getSectionElements(index);
    if (!textElement) return;

    const textCenterRatio = this.getTextNormalizedPosition(textElement);
    if (textCenterRatio >= 0.4 && textCenterRatio <= 0.6) {
      this.scheduleVideoPlay(config.id);
    } else {
      this.cancelVideoTimer(config.id);
    }
  }

  getSectionElements(index) {
    const sectionId = `#sec${String(index + 1).padStart(2, '0')}`;
    const section = document.querySelector(sectionId);
    const textElement = section ? section.querySelector('h2') : null;
    return { section, textElement };
  }

  getTextNormalizedPosition(textElement) {
    const rect = textElement.getBoundingClientRect();
    const windowHeight = window.innerHeight || 1;
    const centerY = rect.top + rect.height / 2;
    return centerY / windowHeight;
  }

  computeBlurAmount(normalizedPosition) {
    const pos = Math.max(0, Math.min(1, normalizedPosition));
    const maxBlur = 12;

    if (pos <= 0.2 || pos >= 0.8) {
      return maxBlur;
    }

    if (pos < 0.4) {
      const t = (pos - 0.2) / 0.2;
      return maxBlur * (1 - t);
    }

    if (pos <= 0.6) {
      return 0;
    }

    if (pos < 0.8) {
      const t = (pos - 0.6) / 0.2;
      return maxBlur * t;
    }

    return maxBlur;
  }

  applyBlurToSubtitle(textElement, amount) {
    textElement.style.filter = `blur(${amount.toFixed(2)}px)`;
  }

  updateSubtitleBlur(index) {
    const { textElement } = this.getSectionElements(index);
    if (!textElement) return;

    const normalizedPosition = this.getTextNormalizedPosition(textElement);
    const blurAmount = this.computeBlurAmount(normalizedPosition);
    this.applyBlurToSubtitle(textElement, blurAmount);
  }

  updateAllSubtitleBlur() {
    this.imageConfigs.forEach((_, index) => {
      this.updateSubtitleBlur(index);
    });
  }

  getAssetAspect(index) {
    const config = this.imageConfigs[index];
    if (config && typeof config.aspect === 'number' && config.aspect > 0) {
      return config.aspect;
    }
    return this.defaultImageAspect;
  }

  updateMediaBounds(targetIndex = this.getDisplayedIndex()) {
    if (!this.cssVariableRoot) {
      return;
    }

    if (!this.width || !this.height) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }

    const viewportAspect = this.height ? this.width / this.height : 1;
    const assetAspect = this.getAssetAspect(targetIndex);

    let scaleX = 1;
    let scaleY = 1;

    if (viewportAspect > 0 && assetAspect > 0) {
      const containRatioX = Math.min(viewportAspect / assetAspect, 1);
      const containRatioY = Math.min(assetAspect / viewportAspect, 1);

      scaleX = containRatioX > 0 ? 1 / containRatioX : 1;
      scaleY = containRatioY > 0 ? 1 / containRatioY : 1;
    }

    this.cssVariableRoot.style.setProperty('--media-scale-x', scaleX.toFixed(6));
    this.cssVariableRoot.style.setProperty('--media-scale-y', scaleY.toFixed(6));
  }

  scheduleVideoPlay(videoId) {
    const video = this.videos[videoId];
    if (!video) return;

    if (!video.paused && !video.ended && video.currentTime > 0) {
      return; // 已在播放
    }

    this.cancelVideoTimer(videoId);
    this.videoTimers[videoId] = setTimeout(() => {
      this.playVideoIfCurrent(videoId);
    }, 1500);
  }

  cancelVideoTimer(videoId) {
    if (this.videoTimers[videoId]) {
      clearTimeout(this.videoTimers[videoId]);
      delete this.videoTimers[videoId];
    }
  }

  cancelAllVideoTimers() {
    Object.keys(this.videoTimers).forEach((videoId) => {
      this.cancelVideoTimer(videoId);
    });
  }

  resolveVideoId(reference) {
    if (typeof reference === 'string') {
      return reference;
    }
    if (typeof reference === 'number') {
      const config = this.imageConfigs[reference];
      return config ? config.id : null;
    }
    return null;
  }

  cancelVideoTimersExcept(reference) {
    const keepId = this.resolveVideoId(reference);
    this.imageConfigs.forEach((config) => {
      if (!keepId || config.id !== keepId) {
        this.cancelVideoTimer(config.id);
      }
    });
  }

  stopVideosExcept(reference) {
    const keepId = this.resolveVideoId(reference);
    this.imageConfigs.forEach((config) => {
      if (!keepId || config.id !== keepId) {
        this.stopVideo(config.id);
      }
    });
  }

  playVideo(videoId) {
    const video = this.videos[videoId];
    if (!video) return;

    try {
      this.cancelVideoTimer(videoId);
      video.pause();
      video.currentTime = 0;
      video.style.display = 'block';
      video.classList.add('playing');

      video.play().then(() => {
        video.style.opacity = '1';
        this.activeVideoId = videoId;
        console.log(`视频 ${videoId} 开始播放`);
      }).catch((error) => {
        console.error(`视频 ${videoId} 播放失败:`, error);
      });
    } catch (error) {
      console.error(`视频 ${videoId} 播放异常:`, error);
    }
  }

  stopVideo(videoId) {
    const video = this.videos[videoId];
    if (!video) return;

    try {
      if (video.paused && video.currentTime === 0 && video.style.display === 'none') {
        return;
      }

      video.pause();
      video.currentTime = 0;
      video.classList.remove('playing');
      video.style.opacity = '0';

      setTimeout(() => {
        video.style.display = 'none';
      }, 300);

      if (this.activeVideoId === videoId) {
        this.activeVideoId = null;
      }

      console.log(`视频 ${videoId} 已停止`);
    } catch (error) {
      console.error(`视频 ${videoId} 停止异常:`, error);
    }
  }

  hideVideoAndShowStillFrame(videoId) {
    const video = this.videos[videoId];
    if (!video) return;

    if (video.style.display === 'none' && video.style.opacity === '0') {
      if (this.activeVideoId === videoId) {
        this.activeVideoId = null;
      }
      return;
    }

    video.classList.remove('playing');
    video.style.opacity = '0';

    setTimeout(() => {
      video.style.display = 'none';
      if (this.activeVideoId === videoId) {
        this.activeVideoId = null;
      }
    }, 300);
  }

  stopAllVideos() {
    this.imageConfigs.forEach((config) => {
      this.cancelVideoTimer(config.id);
      this.stopVideo(config.id);
    });
  }

  getIndexByVideoId(videoId) {
    return this.imageConfigs.findIndex((config) => config.id === videoId);
  }

  playVideoIfCurrent(videoId) {
    const targetIndex = this.getIndexByVideoId(videoId);
    if (targetIndex === -1) {
      return;
    }

    if (this.getDisplayedIndex() !== targetIndex) {
      return;
    }

    this.playVideo(videoId);
  }
}

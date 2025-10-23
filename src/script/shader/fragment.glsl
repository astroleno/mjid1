 uniform vec2 uResolution;
 uniform vec2 uImageResolution;
 uniform vec2 uBounce;
 uniform float uTime;
 
// 纹理数组 - 支持任意数量的图片
uniform sampler2D uTextures[6];
uniform int uCurrentIndex;
uniform int uTargetIndex;
uniform float uTransition;
 
 uniform sampler2D disp;

 varying vec2 vUv;



// 获取纹理数组中的指定索引纹理
vec4 getTexture(int index, vec2 uv) {
    // 使用条件判断来访问纹理数组
    if (index == 0) return texture2D(uTextures[0], uv);
    else if (index == 1) return texture2D(uTextures[1], uv);
    else if (index == 2) return texture2D(uTextures[2], uv);
    else if (index == 3) return texture2D(uTextures[3], uv);
    else if (index == 4) return texture2D(uTextures[4], uv);
    else if (index == 5) return texture2D(uTextures[5], uv);
    else return texture2D(uTextures[0], uv); // 默认返回第一张
}

void main(void) {
    vec2 ratio = vec2(
        min((uResolution.x / uResolution.y) / (uImageResolution.x / uImageResolution.y), 1.0),
        min((uResolution.y / uResolution.x) / (uImageResolution.y / uImageResolution.x), 1.0)
    );

    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    float intensity = 0.7;

    vec4 disp = texture2D(disp, uv);
    vec2 dispVec = vec2(disp.x, disp.y);
    float dispClamp = clamp(dispVec.x,dispVec.y,vUv.y);
    float dist = distance(uv,dispVec) + dispClamp * sin(uTime * 10.0);

    vec2 changeVec = vec2(0.0, -1.0);//真下から真上にかけて変化させる

    // 计算当前和下一张图片的索引
    int currentIdx = clamp(uCurrentIndex, 0, 5);
    int nextIdx = clamp(uTargetIndex, 0, 5);

    // 应用置换效果
    vec2 distPos1 = uv + (dist * intensity * uTransition) * changeVec;
    vec2 distPos2 = uv + (dist * -(intensity * (1.0 - uTransition))) * changeVec;

    // 获取当前和下一张图片的颜色
    vec4 currentColor = getTexture(currentIdx, distPos1);
    vec4 nextColor = getTexture(nextIdx, distPos2);

    // 混合当前和下一张图片
    vec4 finalColor = mix(currentColor, nextColor, uTransition);

    // 调试：显示索引信息（可选）
    // if (uCurrentIndex < 0 || uCurrentIndex > 5) {
    //     finalColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色表示索引错误
    // }

    gl_FragColor = finalColor;
}

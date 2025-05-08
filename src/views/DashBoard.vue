<template>
  <div class="ecommerce">
    <el-row :gutter="20">
      <el-col :sm="24" :md="24" :lg="16">
        <Banner />
      </el-col>
      <el-col :sm="12" :md="12" :lg="4">
          <div class="card art-custom-card" style="height: 13.3rem">
              <div class="card-header">
              <p class="title" style="font-size: 24px">{{totalCameras}}</p>
              <p class="subtitle">摄像头总量</p>
              </div>
              <ArtRingChart
              :data="cameras"
              :color="colorCameras"
              :radius="['56%', '76%']"
              height="7rem"
              :showLabel="false"
              :borderRadius="0"
              />
          </div>
      </el-col>
      <el-col :sm="12" :md="12" :lg="4">
          <div class="card art-custom-card" style="height: 13.3rem">
              <div class="card-header">
                <p class="title" style="font-size: 24px">{{ totalCameras }}</p>
                <p class="subtitle">线程数量</p>
              </div>
              <ArtBarChart
                :showAxisLabel="true"
                :showAxisLine="true"
                :showSplitLine="true"
                :data="threadNums"
                height="7rem"
                barWidth="18px"
              />
          </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :sm="24" :md="24" :lg="8">
        <div class="card art-custom-card weekly-card" style="height: 28.2rem; margin-bottom: 20px;">
              <div class="card-header">
              <p class="title">系统硬件数据</p>
              <p class="subtitle">cpu、内存、显存</p>
              </div>
              <ArtLineChart
              :showAxisLabel="true"
              :showAxisLine="true"
              :showSplitLine="true"
              :showAreaColor="true"
              :data="systemHardwareData"
              height="9rem"
              :colors="linesColor"
              />
              <div class="content">
                <div class="item" v-for="item in weeklyList" :key="item.title">
                    <div class="icon" :style="{ backgroundColor: item.color }">
                      <i :class="['iconfont-sys']" v-html="item.icon"></i>
                    </div>
                    <div class="text">
                      <p class="title">{{ item.title }}</p>
                      <span class="subtitle">{{ item.subtitle }}</span>
                    </div>
                    <div style="width: 80%;"><el-progress :percentage="item.value" :color="item.color"/></div>
                </div>
              </div>
          </div>
          <div class="card art-custom-card" style="height: 26rem; ">
              <div class="card-header">
              <p class="title">存储空间</p>
              <p class="subtitle">xxx</p>
              </div>
              <ArtDualBarCompareChart
              :topData="[50, 80, 120, 90, 60]"
              :bottomData="[30, 60, 90, 70, 40]"
              :xAxisData="['一月', '二月', '三月', '四月', '五月']"
              height="18rem"
              :barWidth="16"
              />
          </div>

      </el-col>
      <el-col :sm="24" :md="24" :lg="16">
          <el-card style="height: 100%;" shadow="never">
              <div class="card-header" style="margin-bottom: 20px;">
                  <p class="title">人流量热力图</p>
              </div>
              <div>
                <div id="Map" ref="mapRef" style="width: 100%; height: 50rem;"></div>
              </div>
          </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import Banner from './widget/Banner.vue'
import {styleJson} from '@/store/modules/styleJson'

const cameras = ref([
  { value: 25, name: '已开启' },
  { value: 2, name: '错误' },
  { value: 5, name: '未开启' },
])
const colorCameras = ['#67C23A', '#F56C6C', '#4C87F3'] // 第二个是成功绿色
// 计算 cameras 中所有 value 的总和
const totalCameras = computed(() => {
    return cameras.value.reduce((sum, item) => sum + item.value, 0)
})

const threadNums = ref([5, 8, 4, 9, 6, 7])

// 每秒添加一个随机数并删除第一个数字
const intervalIdThread = setInterval(() => {
  // 生成1-10的随机数
  const newNum = Math.floor(Math.random() * 10) + 1;
  
  // 更新数组：先删除第一个元素，再添加新元素
  threadNums.value = [...threadNums.value.slice(1), newNum];
}, 1000);

const systemHardwareData = ref([
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
])

const intervalIdHardware = setInterval(() => {
  // 生成三个1-100的随机数
  const randomNums = [
    Math.floor(Math.random() * 100) + 1,
    Math.floor(Math.random() * 100) + 1,
    Math.floor(Math.random() * 100) + 1
  ];
  // 更新 systemHardwareData
  systemHardwareData.value = systemHardwareData.value.map((arr, index) => [
    ...arr.slice(1),
    randomNums[index]
  ]);
  // 更新 weeklyList 中对应位置的 value 值
  randomNums.forEach((num, index) => {
    weeklyList.value[index].value = num;
  });
}, 1000);

const linesColor = ['#79BBFF', '#94D475', '#EDBE76']

const weeklyList = ref([
  {
    icon: '&#xe83d;',
    title: 'CPU',
    subtitle: '使用率',
    value: 0,
    color: '#79BBFF'
  },
  {
    icon: '&#xe739;',
    title: '内存',
    subtitle: '占用率',
    value: 0,
    color: '#94D475'
  },
  {
    icon: '&#xe886;',
    title: '显存',
    subtitle: '占用率',
    value: 0,
    color: '#EDBE76'
  }
])


let map: any = null;

// 定义标记对象的接口
interface MarkerInfo {
    cameraId: string;
    marker: any; // 这里假设 BMap.Marker 类型未导入，若已导入可替换为具体类型
}
// 用于存储所有标记的数组
const markers: MarkerInfo[] = [];

interface IdAndLocation {
    CameraId: string;
    Location: string;
}
const camerasTable = ref<IdAndLocation []>([])

onMounted(async () => {

    loadMapScript(); // 加载百度地图资源

    // 这个地方会获得摄像头信息表，以获得摄像头的坐标信息
    // const result = await CameraService.getCameraInfo()

    const result = [
        {
            "CameraId": "图书馆门口",
            "Load": 1,
            "Show": 1,
            "Lunch": 1,
            "Detect": 0,
            "RTSPinput": "rtsp://example.com/input/camera1",
            "RTSPoutput": "rtsp://example.com/output/camera1",
            "Location": "103.99583, 30.587114"
        },
        {
            "CameraId": "校门口",
            "Load": 1,
            "Show": 1,
            "Lunch": 1,
            "Detect": 0,
            "RTSPinput": "rtsp://example.com/input/camera2",
            "RTSPoutput": "rtsp://example.com/output/camera2",
            "Location": "103.996127, 30.585287"
        },
        {
            "CameraId": "一食堂门口",
            "Load": 1,
            "Show": 0,
            "Lunch": 0,
            "Detect": 0,
            "RTSPinput": "rtsp://example.com/input/camera3",
            "RTSPoutput": "rtsp://example.com/output/camera3",
            "Location": "103.991563, 30.585085"
        },
        {
            "CameraId": "二食堂门口",
            "Load": 1,
            "Show": 0,
            "Lunch": 0,
            "Detect": 0,
            "RTSPinput": "rtsp://example.com/input/camera4",
            "RTSPoutput": "rtsp://example.com/output/camera4",
            "Location": "103.991455, 30.587425"
        }
    ]
    // 将result过滤后赋值
    camerasTable.value = result.map(item => ({
        CameraId: item.CameraId,
        Location: item.Location
    })); 

    // 初始化地图后，将camerasTable.value中的坐标绘制上地图
    const drawMarkersOnMap = () => {
        const { BMap } = window as any;
        camerasTable.value.forEach(camera => {
            const [lat, lng] = camera.Location.split(',').map(Number);
            const point = new BMap.Point(lat, lng);
            const marker = new BMap.Marker(point);
            map.addOverlay(marker);
            markers.push({ cameraId: camera.CameraId, marker });
        });
    };

    // 等待地图初始化完成后绘制标记
    const waitForMapInitialization = () => {
        if (map) {
            drawMarkersOnMap();
        } else {
            setTimeout(waitForMapInitialization, 100);
        }
    };

    waitForMapInitialization();
});


// 之后在需要添加动画时调用此函数
const addBounceAnimationToMarker = (cameraId: string) => {
    
    const { BMap } = window as any;
    console.log('BMap.ANIMATION_BOUNCE:', BMap.ANIMATION_BOUNCE);
    const targetMarker = markers.find(item => item.cameraId === cameraId);
    if (targetMarker) {
        targetMarker.marker.setAnimation(BMAP_ANIMATION_BOUNCE);
    }
};

// 初始化地图
const init = () => {
    const { BMap } = window as any; // 注意要带window，不然会报错
    map = new BMap.Map("Map"); // allmap必须和dom上的id一致
    
    map.centerAndZoom(
        new BMap.Point(103.995529,30.587848),
        18
    ); 
    map.setCurrentCity("成都");
    map.enableScrollWheelZoom(true);
    map.setMapStyleV2({styleJson:styleJson});
};

const loadMapScript = () => {
    // 此处在所需页面引入资源就是，不用再public/index.html中引入
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.className = "loadmap"; // 给script一个类名
    script.src =
        'https://api.map.baidu.com/getscript?v=3.0&ak=O6x5ThpmsemrA9Da452eB2Z6GclLYdCe';
    // 此处需要注意：申请ak时，一定要应用类别一定要选浏览器端，不能选服务端，不然地图会报ak无效
    script.onload = () => {
        // 使用script.onload，待资源加载完成，再初始化地图
        init();
    };
    script.onerror = () => {
        console.error('百度地图脚本加载失败');
    };
    let loadmap = document.getElementsByClassName("loadmap");
    if (loadmap) {
        // 每次append script之前判断一下，避免重复添加script资源标签
        for (var i = 0; i < loadmap.length; i++) {
            document.body.removeChild(loadmap[i]);
        }
    }

    document.body.appendChild(script);
};

onUnmounted(() => {
  clearInterval(intervalIdThread);
  clearInterval(intervalIdHardware);
});
</script>    

<style lang="scss" scoped>
  .ecommerce {
    :deep(.card) {
      box-sizing: border-box;
      padding: 20px;
      background-color: var(--art-main-bg-color);
      border-radius: var(--custom-radius);

      .card-header {
        padding-bottom: 15px;

        .title {
          font-size: 18px;
          font-weight: 500;
          color: var(--art-gray-900);

          i {
            margin-left: 10px;
          }
        }

        .subtitle {
          font-size: 14px;
          color: var(--art-gray-500);
        }
      }
    }

    :deep(.icon-text-widget) {
      display: flex;
      justify-content: space-around;

      .item {
        display: flex;
        align-items: center;

        .icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          margin-right: 10px;
          line-height: 42px;
          color: var(--main-color);
          background-color: var(--el-color-primary-light-9);
          border-radius: 8px;

          i {
            font-size: 20px;
          }
        }

        .content {
          p {
            font-size: 18px;
          }

          span {
            font-size: 14px;
          }
        }
      }
    }

    .no-margin-bottom {
      margin-bottom: 0 !important;
    }

    .el-col {
      margin-bottom: 20px;
    }
  }
  .weekly-card {
  .content {
    margin-top: 40px;

    .item {
      display: flex;
      align-items: center;
      margin-top: 20px;

      .icon {
        width: 42px;
        height: 42px;
        line-height: 42px;
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 8px;

        i {
          font-size: 20px;
        }
      }

      .text {
        margin-left: 10px;
        margin-right: 10px;

        .title {
          font-size: 14px;
          font-weight: 500;
          color: var(--art-gray-800);
        }

        .subtitle {
          font-size: 14px;
          color: var(--art-gray-600);
        }
      }

      .value {
        padding: 6px 12px;
        margin-left: auto;
        font-size: 14px;
        text-align: center;
        background-color: var(--el-color-primary-light-9);
        border-radius: 4px;
      }
    }
  }
}
</style>
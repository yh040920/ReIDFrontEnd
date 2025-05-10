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
                  <el-text size="large">人流量热力图</el-text>
                  <el-date-picker
                    v-model="month"
                    type="month"
                    placeholder="选择月份"
                    size="small"
                    @change="monthChange"
                    style="width: 100px; margin-left: 20px;"
                  />
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
import { websocket, DataViewService, camerasInterface} from '@/api/dataViewApi'
import { CameraService } from '@/api/cameraManagementApi'

const month = ref('')

const monthChange = async () => {
  if(month.value){ // 选定时间改变
    const getPersonNumByMonthResult = await DataViewService.getPersonNumByMonth(month.value);
    if(getPersonNumByMonthResult.success){
      personNum = getPersonNumByMonthResult.personNum
    }else{
      ElMessage.error(getPersonNumByMonthResult.error)
    }
  }
}

const cameras = ref<camerasInterface []>([])

const colorCameras = ['#67C23A', '#F56C6C', '#4C87F3'] // 第二个是成功绿色
// 计算 cameras 中所有 value 的总和
const totalCameras = computed(() => {
    return cameras.value.reduce((sum, item) => sum + item.value, 0)
})

const threadNums = ref([0, 0, 0, 0, 0, 0])

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

interface heatMapDataInterface {
  lat: number;
  lng: number;
  count: number;
}

const heatMapData = ref<heatMapDataInterface []>([])

let personNum: { [key: string]: number } = {}

let socket: WebSocket;

onMounted(async () => {
  // 加载百度地图资源
  await loadMapScript();

  // 连接WebSocket服务器,从后端不断获取硬件数据，后端发回的数据格式为：
  // # 生成线程数据 (1-10)
  //       thread_data = random.randint(1, 10)
        
  //       # 生成系统硬件数据 (1-100)
  //       system_data = [
  //           random.randint(1, 100),
  //           random.randint(1, 100),
  //           random.randint(1, 100)
  //       ]
        
  //       # 发送数据到前端
  //       socketio.emit('hardware_data', {
  //           'thread_data': thread_data,
  //           'system_data': system_data
  //       })
  socket = new WebSocket(websocket);
  
  socket.onopen = () => {
    ElMessage.success('WebSocket连接已建立');
  };
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    // 更新线程数据
    threadNums.value = [...threadNums.value.slice(1), data.thread_data];
    
    // 更新系统硬件数据
    systemHardwareData.value = systemHardwareData.value.map((arr, index) => [
      ...arr.slice(1),
      data.system_data[index]
    ]);
    
    // 更新weeklyList
    data.system_data.forEach((num: number, index: number) => {
      weeklyList.value[index].value = num;
    });
  };
  
  socket.onclose = () => {
    console.log('WebSocket连接已关闭');
    // 可以添加重连逻辑
  };

  // 这个地方会获取以天或者月为单位的每个摄像头的人流量数据格式为{"CameraId": int, "CameraId": int}
  // const getPersonNumByMonthResult = await DataViewService.getPersonNumByMonth("now");
  // if(getPersonNumByMonthResult.success){
  //   personNum = getPersonNumByMonthResult.personNum
  // }else{
  //   ElMessage.error(getPersonNumByMonthResult.error)
  // }
  personNum = {"图书馆门口": 100, "校门口": 200, "一食堂门口": 150, "二食堂门口": 300}
  // 这里获取摄像头的状况分类数量
  // const getCameraStatusNumBySortResult = await DataViewService.getCameraStatusNumBySort()
  // if(getCameraStatusNumBySortResult.success){
  //   cameras.value = getCameraStatusNumBySortResult.cameras.value
  // }else{
  //   ElMessage.error(getCameraStatusNumBySortResult.error)
  // }
  cameras.value = [
    { value: 25, name: '已开启' },
    { value: 2, name: '错误' },
    { value: 5, name: '未开启' },
  ]

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
  ];
  
  // 将result过滤后赋值
  camerasTable.value = result.map(item => ({
      CameraId: item.CameraId,
      Location: item.Location
    })); 

    // 初始化地图
    init();

    // 等待地图和热力图库完全初始化
    await waitForMapAndHeatmapInitialization();

    // 绘制标记点
    drawMarkersOnMap();

    // 初始化热力图
    initHeatmap();
  });

// 绘制标记点到地图
const drawMarkersOnMap = () => {
  const { BMap } = window as any;
  camerasTable.value.forEach(camera => {
    // 注意：百度地图的坐标顺序是先经度后纬度，你之前的代码顺序可能有误
    const [lng, lat] = camera.Location.split(',').map(Number);
    const point = new BMap.Point(lng, lat);
    const marker = new BMap.Marker(point);
    map.addOverlay(marker);
    markers.push({ cameraId: camera.CameraId, marker });
    heatMapData.value.push({lat: Number(lat), lng: Number(lng), count: personNum[camera.CameraId as keyof typeof personNum]})
  });
};

// 初始化热力图
const initHeatmap = () => {
  const { BMapLib } = window as any;
  const heatmapOverlay = new BMapLib.HeatmapOverlay({"radius":20});
  map.addOverlay(heatmapOverlay);
  heatmapOverlay.setDataSet({data: heatMapData.value, max: 300}); // 调整max值以匹配你的数据范围
  heatmapOverlay.show();
};

// 等待地图和热力图库完全初始化
const waitForMapAndHeatmapInitialization = () => {
  return new Promise((resolve) => {
    const check = () => {
      if (map && window.BMapLib && window.BMapLib.HeatmapOverlay) {
        resolve(true);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
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

// 加载地图脚本，返回Promise
const loadMapScript = () => {
  return new Promise((resolve, reject) => {
    // 移除已有的地图脚本
    const existingScripts = document.querySelectorAll('.loadmap');
    existingScripts.forEach(script => script.remove());

    // 创建百度地图核心库脚本
    const coreScript = document.createElement('script');
    coreScript.type = 'text/javascript';
    coreScript.className = 'loadmap core';
    coreScript.src = 'https://api.map.baidu.com/getscript?v=3.0&ak=O6x5ThpmsemrA9Da452eB2Z6GclLYdCe';
    
    // 核心库加载完成后，加载热力图扩展库
    coreScript.onload = () => {
      loadHeatmapLibrary().then(resolve).catch(reject);
    };
    
    coreScript.onerror = (error) => {
      ElMessage.error('百度地图核心库加载失败');
      reject(error);
    };
    
    document.body.appendChild(coreScript);
  });
};
declare var window: Window & {
    [key: string]: any; // 允许window对象有任意属性
};
// 加载热力图扩展库，返回Promise
const loadHeatmapLibrary = () => {
  return new Promise((resolve, reject) => {
    const heatmapScript = document.createElement('script');
    heatmapScript.type = 'text/javascript';
    heatmapScript.className = 'loadmap heatmap';
    heatmapScript.src = 'https://api.map.baidu.com/library/Heatmap/2.0/src/Heatmap_min.js';

    // 扩展库加载完成后，初始化地图
    heatmapScript.onload = () => {
      if (window.BMap && window.BMapLib && window.BMapLib.HeatmapOverlay) {
        resolve(true);
      } else {
        ElMessage.error('百度地图热力图组件加载失败');
        reject(new Error('BMapLib.HeatmapOverlay not found'));
      }
    };
    
    heatmapScript.onerror = (error) => {
      ElMessage.error('百度地图热力图组件加载失败');
      reject(error);
    };
    
    document.body.appendChild(heatmapScript);
  });
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
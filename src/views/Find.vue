<template>
    <el-card shadow="never">
        <el-text class="mx-1" size="large" style="font-weight: bold; font-size: 24px;">目标图片</el-text>
        <el-divider />
        <div style="margin-top: 20px ;">
            <el-upload
                v-model:file-list="fileList"
                :action=FindService.action
                list-type="picture-card"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
            >
                <el-icon><Plus /></el-icon>
            </el-upload>

            <el-dialog v-model="dialogVisible" style="width: fit-content;">
                <img w-full :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
            <div>
                <el-button type="" style="margin-right: 40px;" @click="startFind">开始查找</el-button>
                <el-date-picker
                    v-model="timeLimit"
                    type="datetimerange"
                    start-placeholder="开始时间"
                    end-placeholder="截至时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    date-format="YYYY/MM/DD ddd"
                    time-format="A hh:mm:ss"
                    style="margin-right: 40px;"
                />
                <el-input
                    v-model="textFind"
                    style="width: 400px"
                    placeholder="请输入文本描述"
                    :suffix-icon="Tickets"
                />
            </div>
            <el-button type="" @click="showHistoryV" style="border: none;">历史记录<el-icon><Memo /></el-icon></el-button>
            <el-drawer
                v-model="showHistory"
                size="30%"
                :with-header="false"
            >
                <el-text class="mx-1" size="large" style="font-weight: bold; font-size: 24px;">历史记录</el-text>
                <el-divider />
                <el-timeline style="margin-left: 2%;">
                    <el-timeline-item  v-for="yyh in history" :key="yyh.Time" :timestamp="yyh.Time" placement="top" type="primary" :hollow='true'>
                        <el-card shadow="hover">
                            <el-scrollbar>
                                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                                    <el-image v-for="yyyh in yyh.findImages" :key="yyyh.url" style="height: 100px; width: auto;" :src="yyyh.url" />
                                </div>
                            </el-scrollbar>
                            <el-row :gutter="10">
                                <el-col :span="20">
                                    <el-text truncated class="mx-1" size="small" style="width: 80%;">
                                        <el-icon><LocationInformation /></el-icon>
                                        {{ yyh.findResults.map((item) => item.CameraId).join(",") }}
                                    </el-text>
                                </el-col>
                                <el-col :span="4">
                                    <el-button type="" @click="recovery(yyh)" style="border: none;">恢复</el-button>
                                </el-col>
                            </el-row>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </el-drawer>
        </div>
        <el-divider />
        <el-row :gutter="10">
            <el-col :span="16">
                <div style="display: flex; flex-wrap: wrap; ">
                    <el-text size="large" style="font-weight: bold; font-size: 24px;">查找结果</el-text>
                    <el-tooltip
                        class="box-item"
                        effect="dark"
                        content="点击放大地图"
                        placement="top"
                    >
                        <el-button @click="toggleMapFullscreen" size="large" style="border: none;"><el-icon><Rank /></el-icon></el-button>
                    </el-tooltip>
                </div>
                <el-card shadow="never" style="border: none;">
                    <div id="Map" ref="mapRef"></div>
                </el-card>
            </el-col>
            <el-col :span="8">
                <el-text size="large" style="font-weight: bold; font-size: 24px;">结果路线</el-text>
                <el-card shadow="never" style="margin-top: 20px; border: none; border-left: 1px solid #EBEEF5;">
                    <el-empty v-if="findResults.length === 0" description="暂无路线" :image="emptyImg"/>
                    <el-timeline v-if="findResults.length > 0">
                        <el-scrollbar style="height: 55vh;">
                            <el-timeline-item  v-for="yyh in findResults" :key="yyh.Time" :timestamp="yyh.Time" placement="top" type="primary" :hollow='true'>
                                <el-card class="historyCard">
                                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                                        <el-image v-for="yyyh in yyh.resultUrl" :key="yyyh" style="height: 100px; width: auto;" :src="yyyh" />
                                    </div>
                                    <el-text class="mx-1" size="small" style="">{{ yyh.CameraId }}</el-text>
                                </el-card>
                            </el-timeline-item>
                        </el-scrollbar>
                    </el-timeline>
                </el-card>
            </el-col>
        </el-row>
    </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile } from 'element-plus'
import { FindService, findResult, historyInterface} from '@/api/findApi'
import { Tickets } from '@element-plus/icons-vue'
import {styleJson} from '@/store/modules/styleJson'
import emptyImg from '@/assets/img/state/empty.png';
import { useSelectedStore } from '@/store/modules/useSelectedStore'
const SelectedStore = useSelectedStore()

interface IdAndLocation {
    CameraId: string;
    Location: string;
}
const camerasTable = ref<IdAndLocation []>([])

//   {name: 'food.jpeg', url: '',}用于存储查找目标图片的列表
const fileList = ref<UploadUserFile[]>([
    {
        name: 'food.jpeg',
        url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.UWgMkVm4bkDKwMOnrWZ0vAHaLt?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',
    },
    {
        name: 'food.jpeg',
        url: 'https://tse1-mm.cn.bing.net/th/id/OIP-C.UWgMkVm4bkDKwMOnrWZ0vAHaLt?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',
    },
])

const findResults = ref<findResult[]>([])
const showHistory = ref(false)
const timeLimit = ref('')
const textFind = ref('')
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove: UploadProps['onRemove'] = async (uploadFile, uploadFiles) => {
    // 向后端发送uploadFile.name以删除图片
    const handleRemoveResult = await FindService.deleteImage(uploadFile.name);
    if(handleRemoveResult.success){
        ElMessage.success("删除成功");
    }else{
        ElMessage.error(handleRemoveResult.error);
    }
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}

let map: any = null;

const mapRef = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);

const toggleMapFullscreen = () => {
  if (!mapRef.value) return;

  if (!isFullscreen.value) {
    enterFullscreen(mapRef.value);
  } else {
    exitFullscreen();
  }
};

const enterFullscreen = (element: HTMLElement) => {
  const requestFullscreen = 
    element.requestFullscreen ||
    (element as any).webkitRequestFullscreen ||
    (element as any).mozRequestFullScreen ||
    (element as any).msRequestFullscreen;

  if (requestFullscreen) {
    requestFullscreen.call(element);
    isFullscreen.value = true;
  }
};

const exitFullscreen = () => {
  const exitFullscreen = 
    document.exitFullscreen ||
    (document as any).webkitExitFullscreen ||
    (document as any).mozCancelFullScreen ||
    (document as any).msExitFullscreen;

  if (exitFullscreen) {
    exitFullscreen.call(document);
    isFullscreen.value = false;
  }
};

// 监听全屏变化事件
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// 定义标记对象的接口
interface MarkerInfo {
    cameraId: string;
    marker: any; // 这里假设 BMap.Marker 类型未导入，若已导入可替换为具体类型
}

// 用于存储所有标记的数组
const markers: MarkerInfo[] = [];

onMounted(async () => {

    if(SelectedStore.images.length > 0){
        fileList.value = SelectedStore.images;
    }

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

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
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

const startFind = async() => {
    // 查找逻辑, 模拟查找结果
    // const startFindResult = await FindService.informStartFind({findTimeLimit: timeLimit.value, findText: textFind.value});
    // if(startFindResult.success){
    if(true){
        // findResults.value = startFindResult.data; // 这里就是请求得到结果
        findResults.value = [
            {
                Time: "2018/4/12 16:00:00",
                CameraId: "图书馆门口",
                Location: [103.99583, 30.587114],
                resultUrl: ['https://tse2-mm.cn.bing.net/th/id/OIP-C.iVKpmfAaxfF0eWw08UI9gQHaHa?w=154&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',
                    "https://tse2-mm.cn.bing.net/th/id/OIP-C.iVKpmfAaxfF0eWw08UI9gQHaHa?w=154&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7"
                ]
            },
            {
                Time: "2018/4/12 16:01:00",
                CameraId: "一食堂门口",
                Location: [103.991563, 30.585085],
                resultUrl: ['https://tse2-mm.cn.bing.net/th/id/OIP-C.iVKpmfAaxfF0eWw08UI9gQHaHa?w=154&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',]
            },
            {
                Time: "2018/4/12 16:02:00",
                CameraId: "二食堂门口",
                Location: [103.991455, 30.587425],
                resultUrl: ['https://tse2-mm.cn.bing.net/th/id/OIP-C.iVKpmfAaxfF0eWw08UI9gQHaHa?w=154&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7',]
            }
        ]

        // 实现在地图上绘制和画结果路线绘制
        findResults.value.forEach((con) =>{
            const {CameraId, Location, resultUrl} = con;
            drawImagesAroundPoint(Location, resultUrl);
        });

        // 提取坐标
        const locations = findResults.value.map(item => item.Location);
        const animationName = findResults.value.map(item => item.CameraId);
        drawLine(locations, animationName);
    }else{
        // ElMessage.error(startFindResult.error);
    }
}


// 在指定点周围绘制图像的函数, 查询的结果应该是摄像头名称坐标对应查找图片的url，遍历摄像头名称和坐标，每次调用这个方法传入imageUrls和Point(103.991455, 30.587425)即可
const drawImagesAroundPoint = (Location:number[], resultUrl:string[]) => {

    const { BMap } = window as any;
    const targetPoint = new BMap.Point(Location[0], Location[1]);
    const imageUrls = resultUrl;

    // 定义图像偏移量
    const offset = new BMap.Size(10, -70);

    // 创建包含两张图片的 HTML 元素
    const imagesContainer = document.createElement('div');
    imagesContainer.style.display = 'flex';

    imagesContainer.style.width = 'auto'; // 适当调整宽度以容纳两张图片
    imagesContainer.style.height = '50px';

    imageUrls.forEach((url, index) => {
        const image = new Image();
        image.src = url;
        image.style.width = 'auto';
        image.style.height = '50px';
        // 通过负边距实现百叶窗效果
        image.style.marginLeft = `${index === 0? 0 : -25}px`; 
        imagesContainer.appendChild(image);
    });

    const label = new BMap.Label('', {
        position: targetPoint,
        offset: offset
    });
    label.setContent(imagesContainer.outerHTML);
    map.addOverlay(label);
};

const drawLine = (locations: any, animationNames: string[]) => {
    console.log(markers);
    
    animationNames.forEach((name) => {
        console.log(name);
        addBounceAnimationToMarker(name);
    })
    const { BMap } = window as any;
    // 这个错误应该是正常的，编译器没找到来源，不用管
    var sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
        scale: 0.6,//图标缩放大小
        strokeColor:'#fff',//设置矢量图标的线填充颜色
        strokeWeight: '1',//设置线宽
    });
    var icons = new BMap.IconSequence(sy, '10', '30');
    // 创建polyline对象
    var pois = locations.map((location: any) => new BMap.Point(location[0], location[1]));
    var polyline = new BMap.Polyline(pois, {
        enableEditing: false,//是否启用线编辑，默认为false
        enableClicking: true,//是否响应点击事件，默认为true
        icons:[icons],
        strokeWeight:'8',//折线的宽度，以像素为单位
        strokeOpacity: 0.8,//折线的透明度，取值范围0 - 1
        strokeColor:"#79BBFF" //折线颜色
    });

    map.addOverlay(polyline);          //增加折线
}


const history = ref<historyInterface[]>()
const showHistoryV = async () => {
    showHistory.value = !showHistory.value
    // const showHistoryVResult = await FindService.getHistory();
    // if(showHistoryVResult.success){
    if(true){
        // history.value = showHistoryVResult.data;
        history.value = [
        {
            Time: '2021-06-28 16:00:00',
            findImages: [{
                name: 'image1',
                url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.47et1Kp5k0tr1rJPGSQrBQAAAA?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7'
            },
            {
                name: 'image1',
                url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.47et1Kp5k0tr1rJPGSQrBQAAAA?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7'
            },
            {
                name: 'image1',
                url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.47et1Kp5k0tr1rJPGSQrBQAAAA?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7'
            }],
            findResults: [
            {
                Time: "2018/4/12 16:00:00",
                CameraId: "图书馆门口",
                Location: [103.99583, 30.587114],
                resultUrl: ['https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7',
                    "https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7"
                ]
            },
            {
                Time: "2018/4/12 16:01:00",
                CameraId: "一食堂门口",
                Location: [103.991563, 30.585085],
                resultUrl: ['https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7',]
            }
            ]
        },
        {
            Time: '2021-06-28 16:00:00',
            findImages: [{
                name: 'image1',
                url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.47et1Kp5k0tr1rJPGSQrBQAAAA?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7'
            },
            {
                name: 'image1',
                url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.47et1Kp5k0tr1rJPGSQrBQAAAA?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7'
            },
            {
                name: 'image1',
                url: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.47et1Kp5k0tr1rJPGSQrBQAAAA?w=115&h=180&c=7&r=0&o=5&dpr=1.8&pid=1.7'
            }],
            findResults: [
            {
                Time: "2018/4/12 16:00:00",
                CameraId: "图书馆门口",
                Location: [103.99583, 30.587114],
                resultUrl: ['https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7',
                    "https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7"
                ]
            },
            {
                Time: "2018/4/12 16:01:00",
                CameraId: "一食堂门口",
                Location: [103.991563, 30.585085],
                resultUrl: ['https://tse4-mm.cn.bing.net/th/id/OIP-C.u7vpthRCGVxLIaGacmcLQQHaHa?w=187&h=188&c=7&r=0&o=5&dpr=1.8&pid=1.7',]
            }
            ]
        }
        ]
    }else{
        // ElMessage.error(showHistoryVResult.error);
    }
}  

const recovery = (yyh: historyInterface) => {
    showHistory.value = false;
    fileList.value = yyh.findImages;
    findResults.value = yyh.findResults;

    // 实现在地图上绘制和画结果路线绘制
    findResults.value.forEach((con) =>{
        const {CameraId, Location, resultUrl} = con;
        drawImagesAroundPoint(Location, resultUrl);
    });

    // 提取坐标
    const locations = findResults.value.map(item => item.Location);
    const animationName = findResults.value.map(item => item.CameraId);
    drawLine(locations, animationName);
}
</script>



<style scoped>

.historyCard {
    border: none;
    box-shadow: none;
}

/* 初始样式 */
#Map {
      width: 100%;
      height: 55vh;
      border: 1px solid #EBEEF5;
      cursor: pointer;
    }

</style>    
import { useEffect, useState } from "react";
import TitleBar from "@/TitleBar";

import { ConfigProvider, Layout, message, Modal, theme, Typography } from "antd";
import { isWin11, ThemeFun } from '@/mod/ThemeConfig'
import { WindowBg } from "@/mod/WindowCode";
import { invoke } from "@tauri-apps/api/core";
import { GetFileinfo, getParentPath } from "@/mod/FileGet";
import { Window } from '@tauri-apps/api/window';
import { AppMainStore, AppSetStore, TentativeStore } from "@/mod/store";
import { useAsyncEffect } from "ahooks";
import dayjs from "dayjs";
import zhCN from 'antd/locale/zh_CN';
import BlurredBackground from "@/mod/BlurredBackground";
import PageRouter from "./Content";
import { BrowserRouter } from "react-router-dom";

import "./App.less";
const { Paragraph, Text, Title } = Typography;
const { Content } = Layout;
const config = theme.getDesignToken()
window.appWindow = new Window('main');


const matchMedia = window.matchMedia('(prefers-color-scheme: light)');
const inMsix = await invoke<boolean>('is_running_in_msix');
const isDebug = await invoke<boolean>('is_debug_build');
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loading = false;
  const { setAppMain, eFiles } = AppMainStore()
  const [themeDack, setThemeDack] = useState(!matchMedia.matches);
  const [expire, setExpire] = useState(isDebug ? false : !inMsix);
  const { setTentative, Themeconfig } = TentativeStore()
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setTentative({ messageApi })
  }, [messageApi])
  const handleOk = () => {
    location.reload();    // 重新加载当前页面
  };

  const handleCancel = () => {
    setIsModalOpen(false)
  };
  function checkDateStatus() {
    if (!inMsix) return
    const targetDate = dayjs('2025-11-01');
    const today = dayjs().startOf('day');
    const expiry = dayjs(targetDate).startOf('day');
    setExpire(expiry.isSame(today))
  }
  //设置窗口材料
  useAsyncEffect(async () => {

    let eFile = ''
    try {
      const eFilesLib: string = await invoke('get_install_path');
      eFile = getParentPath(eFilesLib) + "\\e.exe"

      setAppMain({ eFiles: eFile })
    } catch (error) {
      console.error('Error setting theme:', error);
    }

    if (isWin11) {
      WindowBg('Acrylic', themeDack)
    }

    const getEinfo = async () => {
      const json = await GetFileinfo(eFile)
      setIsModalOpen(!json.isFile)
    }
    getEinfo()
    const handleChange = function (this: any) {
      //appWindow.setTheme('')
      setThemeDack(!this.matches);
    };
    matchMedia.addEventListener('change', handleChange);
    checkDateStatus()

  }, [])
  //同步窗口标题
  const { primaryColor, fontFamily } = AppSetStore()


  useEffect(() => {
    const thems = ThemeFun(themeDack, 'Acrylic', {
      colorPrimary: primaryColor,
      fontFamily: `'${fontFamily}',${config.fontFamily}`
    })
    setTentative({ Themeconfig: thems })
  }, [themeDack, primaryColor, fontFamily, setTentative])

  return (
    <ConfigProvider
      theme={Themeconfig}
      locale={zhCN}
    >
      {contextHolder}
      {
        (themeDack) &&
        <BlurredBackground
          src="https://images.unsplash.com/photo-1743657166981-8d8e11d03c3e"
          blur={12}
        />
      }

      <BrowserRouter>
        <TitleBar
          Themeconfig={Themeconfig}
          themeDack={themeDack}
          loading={loading}
        />
        <Layout style={{
          padding: 0,
        }}>
          <Content className="container">
            {!expire ? (
   
              <PageRouter themeDack={false} />

            ) :
              <Title level={3} className="important-margin-top">
                抱歉，本版本已结束或版本异常，请更新程序版本！
              </Title>
            }
          </Content>
        </Layout>
      </BrowserRouter>
      <Modal
        closeIcon={false}
        maskClosable={false}
        keyboard={false}
        title="找不到IDE主程序！"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        cancelText="我知道了"
        okText="重新检测"

      >
        <Paragraph>
          {eFiles && <Text code>{eFiles}</Text>}
          <br />
          <Text type="danger" strong>找不到易语言主体！</Text>
          <br />
          <br />
          <Text strong>软件功能将受限</Text>
          <br />
          <Text >如果你已经安装了易语言，请先打开一次易语言再重新打开本程序。</Text>
        </Paragraph>
      </Modal>
    </ConfigProvider >
  );
}

export default App;

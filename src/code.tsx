// src/components/StoreCode.jsx
import React, { FC, useEffect, useState, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api/core";
import { Modal, Button, Result } from 'antd';
import { LockOutlined, ReloadOutlined } from '@ant-design/icons';
import { openStoreRating } from './mod/openStoreRating';
import { TentativeStore } from './mod/store';
const inMsix = await invoke<boolean>('is_running_in_msix');
const isDebug = await invoke<boolean>('is_debug_build');

export interface StoreCodeProps {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const StoreCode: FC<StoreCodeProps> = ({ setLoading }) => {
    const { licenseStatus, setTentative } = TentativeStore();
    const [isValidLicense, setIsValidLicense] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryAttempt, setRetryAttempt] = useState(0);
    const maxRetries = 5;
    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

    const setLicenseStatus = (status: string) => {
        setTentative({ licenseStatus: status });
    };

    // 解析文本错误消息
    const parseErrorMessage = (errorText: string) => {
        // 尝试匹配错误对象格式
        const regex = /Error\s*\{\s*code:\s*HRESULT\(([^)]+)\),\s*message:\s*"([^"]+)"\s*\}/;
        const match = errorText.match(regex);

        if (match && match.length >= 3) {
            const code = match[1];
            const message = match[2];
            return `许可证验证失败，错误代码：${code}、错误原因：${message}`;
        }

        // 如果匹配失败，返回原始错误文本
        return `许可证验证失败: ${errorText}`;
    };

    // 清理定时器
    useEffect(() => {
        return () => {
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
            }
        };
    }, []);

    // 检查许可证（带重试逻辑）
    const checkLicenseWithRetry = async (attempt: number = 1) => {
        try {
            setIsRetrying(true);
            setRetryAttempt(attempt);
            if (!inMsix && !isDebug) {
                setLicenseStatus('非法访问，请勿修改程序！');
                setIsRetrying(false);
                setShowModal(true);
                return false;
            }
            setLicenseStatus(`正在验证许可证 (尝试 ${attempt}/${maxRetries})...`);

            const isValid = await invoke<boolean>('verify_license');
            setIsValidLicense(isValid);

            if (isValid) {
                setLicenseStatus('许可证有效，欢迎使用完整版！');
                setShowModal(false);
                setIsRetrying(false);
                setTimeout(() => {
                    setLoading(false);
                }, 360);

            } else {
                if (attempt < maxRetries) {
                    retryTimerRef.current = setTimeout(() => {
                        checkLicenseWithRetry(attempt + 1);
                    }, 1500);
                } else {
                    setLicenseStatus('未检测到有效许可证，部分功能受限');
                    setIsRetrying(false);
                    setShowModal(true);
                }
            }
            return isValid;
        } catch (error) {
            console.error("许可证验证失败:", error);

            // 将错误转换为字符串并解析
            const errorText = typeof error === 'string' ? error : error?.toString() || '未知错误';
            const parsedError = parseErrorMessage(errorText);

            if (attempt < maxRetries) {
                setLicenseStatus(`验证失败，正在重试 (${attempt}/${maxRetries})...`);
                retryTimerRef.current = setTimeout(() => {
                    checkLicenseWithRetry(attempt + 1);
                }, 1500);
            } else {
                setLicenseStatus(parsedError);
                setIsRetrying(false);
                setShowModal(true);
            }
            return false;
        }
    };

    useEffect(() => {
        let unlisteners: (() => void)[] = [];

        const setupListeners = async () => {
            try {
                const unlistenStatus = await listen('license-status', (event: { payload: string }) => {
                    setLicenseStatus(event.payload);
                    setIsValidLicense(false);
                    setShowModal(true);
                });

                const unlistenError = await listen('license-error', (event: { payload: string }) => {
                    // 解析文本错误消息
                    const parsedError = parseErrorMessage(event.payload);
                    setLicenseStatus(parsedError);
                    setIsValidLicense(false);
                    setShowModal(true);
                });

                unlisteners = [unlistenStatus, unlistenError];
            } catch (error) {
                console.error("设置监听器失败:", error);
                setLicenseStatus(`设置监听器失败: ${error?.toString() || '未知错误'}`);
            }
        };

        const init = async () => {
            try {
                setLoading(true);
                await setupListeners();
                await checkLicenseWithRetry(1);
            } catch (error) {
                console.error("初始化失败:", error);
                setLicenseStatus(`初始化错误: ${error?.toString() || '未知错误'}`);
            }
        };

        init();

        return () => {
            unlisteners.forEach(unlisten => unlisten());
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
            }
        };
    }, [setLoading]);

    const handleBuyClick = () => {
        openStoreRating();
    };

    const handleModalClose = () => {
        window.appWindow.close()
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div>


            <Modal
                title="许可证验证"
                keyboard={false}
                maskClosable={false}
                open={showModal && !isValidLicense}
                onCancel={handleModalClose}

                footer={[
                    <Button
                        key="refresh"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        disabled={isRetrying}
                    >
                        重新验证
                    </Button>,
                    <Button
                        key="buy"
                        type="primary"
                        onClick={handleBuyClick}
                        icon={<LockOutlined />}
                        disabled={isRetrying}
                    >
                        前往购买
                    </Button>,
                ]}
                width={600}
            >
                <Result
                    status="warning"
                    title="未检测到有效许可证"
                    subTitle="您需要购买完整版才能使用所有功能"
                    extra={
                        <div>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{licenseStatus}</p>
                            {isRetrying && <p style={{ color: '#1890ff' }}>正在尝试重新验证 ({retryAttempt}/{maxRetries})...</p>}
                            <p>请购买正版软件，享受无限制功能体验！</p>
                        </div>
                    }
                />
            </Modal>
        </div>
    );
};
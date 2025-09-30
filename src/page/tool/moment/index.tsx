import { useState, useEffect } from 'react';
import { Card, Space, Statistic, DatePicker, InputNumber, Alert, Tooltip, Row, Col, Divider, Skeleton } from 'antd';
import { ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { GetHours } from 'chinesehours';
import { Calendar } from 'chinesehours';

const TimestampTool = () => {
    // 当前时间状态
    const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
    // 时间戳输入值
    const [timestamp, setTimestamp] = useState<number>(Math.floor(Date.now() / 1000));
    // 日期时间值
    const [dateTime, setDateTime] = useState<Dayjs>(dayjs());
    // 当前时辰值
    const [currentShichen, setCurrentShichen] = useState<string>('');
    // 当前农历值
    const [currentLunarDate, setCurrentLunarDate] = useState<any>(null);
    // 转换后的时辰值
    const [convertedShichen, setConvertedShichen] = useState<string>('');
    // 转换后的农历值
    const [convertedLunarDate, setConvertedLunarDate] = useState<any>(null);
    // 转换模式 (timestampToDate 或 dateToTimestamp)
    const [mode, setMode] = useState<string>('timestampToDate');

    // 实时时钟效果
    useEffect(() => {
        const timer = setInterval(() => {
            const now = dayjs();
            setCurrentTime(now);

            // 更新当前时辰
            const chinah = GetHours('[地支] [时辰] [时刻]');
            setCurrentShichen(chinah.format);

            // 更新当前农历
            const solarDate = now.toDate();
            const lunarDate = Calendar.solar2lunar(
                solarDate.getFullYear(),
                solarDate.getMonth() + 1,
                solarDate.getDate()
            );
            setCurrentLunarDate(lunarDate);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 更新时间戳对应的时辰和农历
    const updateConvertedDateTimeInfo = (date: Dayjs) => {
        // 更新转换后的时辰
        const dateObj = date.toDate();
        const chinah = GetHours('[地支] [时辰] [时刻]', dateObj);
        setConvertedShichen(chinah.format);

        // 更新转换后的农历
        const lunarDate = Calendar.solar2lunar(
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            dateObj.getDate()
        );
        setConvertedLunarDate(lunarDate);
    };

    // 时间戳转换为日期时间
    useEffect(() => {
        if (mode === 'timestampToDate' && timestamp) {
            // 将时间戳转换为dayjs对象 (时间戳单位：秒)
            const newDateTime = dayjs.unix(timestamp);
            setDateTime(newDateTime);
            updateConvertedDateTimeInfo(newDateTime);
        }
    }, [timestamp, mode]);

    // 日期时间转换为时间戳
    useEffect(() => {
        if (mode === 'dateToTimestamp' && dateTime) {
            // 将dayjs对象转换为时间戳 (单位：秒)
            setTimestamp(Math.floor(dateTime.valueOf() / 1000));
            updateConvertedDateTimeInfo(dateTime);
        }
    }, [dateTime, mode]);

    // 处理时间戳变化
    const handleTimestampChange = (value: number | null) => {
        if (value !== null) {
            setTimestamp(value);
            setMode('timestampToDate');
        }
    };

    // 处理日期时间变化
    const handleDateTimeChange = (date: Dayjs | null) => {
        if (date !== null) {
            setDateTime(date);
            setMode('dateToTimestamp');
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1920px', margin: '0 auto' }}>
            <Space style={{ width: '100%' }} size="large" align="start" direction="horizontal">
                {/* 当前时间和日期显示 */}
                <Card
                    style={{ width: 280, height: "100%" }}
                    title={
                        <span>
                            <ClockCircleOutlined /> 当前时间
                        </span>
                    }
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Statistic
                            value={currentTime.format('HH:mm:ss')}
                            valueStyle={{ fontSize: '32px', color: '#1890ff', textAlign: 'center' }}
                        />

                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="公历日期"
                                    value={currentTime.format('YYYY年MM月DD日')}
                                    valueStyle={{ fontSize: '16px' }}
                                />
                            </Col>
                            <Col span={12}>

                                {currentLunarDate ? <Statistic
                                    title="星期"
                                    value={currentLunarDate?.ncWeek}
                                    valueStyle={{ fontSize: '16px' }}
                                />
                                    :
                                    <Skeleton paragraph={{ rows:2 }} title={false}/>
                                }
                            </Col>
                        </Row>

                        <Divider style={{ margin: '12px 0' }} />

                        {
                            currentShichen ? <Tooltip title="中国传统时辰">
                                <Statistic
                                    title="时辰"
                                    value={currentShichen}
                                    valueStyle={{ fontSize: '16px', }}
                                />
                            </Tooltip>
                                :
                                <Skeleton paragraph={{ rows: 1 }} title={false}/>
                        }

                        {currentLunarDate ? (
                            <Space direction="vertical" style={{ width: '100%' }} size="small">
                                <Statistic
                                    title="农历日期"
                                    value={`${currentLunarDate.IMonthCn}${currentLunarDate.IDayCn}`}
                                    valueStyle={{ fontSize: '16px' }}
                                />
                                <Statistic
                                    title="干支纪年"
                                    value={`${currentLunarDate.gzYear}年 ${currentLunarDate.gzMonth}月 ${currentLunarDate.gzDay}日`}
                                    valueStyle={{ fontSize: '14px' }}
                                />
                                <Space>
                                    <Statistic
                                        title="生肖"
                                        value={currentLunarDate.zodiac}
                                        valueStyle={{ fontSize: '14px' }}
                                    />
                                    <Statistic
                                        title="五行"
                                        value={currentLunarDate.GzNy}
                                        valueStyle={{ fontSize: '14px' }}
                                    />
                                </Space>
                                <Statistic
                                    title="节气"
                                    value={currentLunarDate.isTerm ? currentLunarDate.Term : '无'}
                                    valueStyle={{ fontSize: '14px' }}
                                />
                            </Space>
                        ) :
                            <Skeleton />
                        }
                    </Space>
                </Card>

                {/* 时间戳转换区域 */}
                <Card
                    title={
                        <span>
                            <SyncOutlined /> 时间戳转换
                        </span>
                    }
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Alert
                            message="时间戳通常是从1970年1月1日00:00:00 UTC开始计算的秒数或毫秒数。本工具使用秒数时间戳。"
                            type="info"
                            showIcon
                        />


                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={dateTime}
                            onChange={handleDateTimeChange}
                            style={{ minWidth: '220px' }}
                            placeholder="请选择日期时间"
                        />

                        <span>转换</span>
                        <InputNumber
                            placeholder="请输入时间戳（秒）"
                            min={0}
                            max={253402271999}
                            value={timestamp}
                            onChange={handleTimestampChange}
                            style={{ minWidth: '200px' }}
                            precision={0}
                            addonBefore="时间戳（秒）"
                        />


                        {/* 转换后的时辰和农历信息 */}
                        {convertedShichen && convertedLunarDate && (
                            <Card size="small" title="时辰农历信息">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="时辰"
                                            value={convertedShichen}
                                            valueStyle={{ fontSize: '14px' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="农历日期"
                                            value={`${convertedLunarDate.IMonthCn}${convertedLunarDate.IDayCn}`}
                                            valueStyle={{ fontSize: '14px' }}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginTop: '8px' }}>
                                    <Col span={12}>
                                        <Statistic
                                            title="干支纪年"
                                            value={`${convertedLunarDate.gzYear}年 ${convertedLunarDate.gzMonth}月 ${convertedLunarDate.gzDay}日`}
                                            valueStyle={{ fontSize: '14px' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="生肖"
                                            value={convertedLunarDate.zodiac}
                                            valueStyle={{ fontSize: '14px' }}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginTop: '8px' }}>
                                    <Col span={12}>
                                        <Statistic
                                            title="五行"
                                            value={convertedLunarDate.GzNy}
                                            valueStyle={{ fontSize: '14px' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="节气"
                                            value={convertedLunarDate.isTerm ? convertedLunarDate.Term : '无'}
                                            valueStyle={{ fontSize: '14px' }}
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        )}
                    </Space>
                </Card>
            </Space>
        </div>
    );
};

export default TimestampTool;
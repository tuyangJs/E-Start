import { formatBytes } from "@/mod/FileGet";
import { ProColumns } from "@ant-design/pro-components";
import { Tooltip } from "antd";
import dayjs from "dayjs";
import { TableListItem } from "./RenderingList";
export const DateTo = (_: number) => {
    const TODAY = dayjs();
    const inputDate = dayjs(_ as number);

    // 计算日期差异
    const diffDays = TODAY.diff(inputDate, 'day');

    if (inputDate.isSame(TODAY, 'day')) {
        // 当天显示时间
        return inputDate.format('HH:mm:ss');
    } else if (diffDays === 1) {
        // 昨天
        return `昨天 ${inputDate.format('HH:mm:ss')}`;
    } else if (diffDays === 2) {
        // 前天
        return `前天 ${inputDate.format('HH:mm:ss')}`;
    } else if (inputDate.year() === TODAY.year()) {
        // 同年显示月日+时间
        return `${inputDate.format('M月D日')} ${inputDate.format('HH:mm:ss')}`;
    } else {
        // 跨年显示完整日期
        return inputDate.format('YYYY年MM月DD日 HH:mm:ss');
    }
}

export const columns = (expandFile: boolean) => {
  // 你要插入的新列
  const extraColumn: ProColumns<TableListItem> = {
    title: '文件位置',
    dataIndex: 'path',
  };

  return [
    {
      title: '项目名称',
      width: 100,
      dataIndex: 'name',
      tooltip: {
        title: "双击项目名称打开项目，右键可以查看操作菜单",
        placement: 'bottomRight'
      }
    },
    {
      title: '大小',
      width: 45,
      dataIndex: 'size',
      hideInSearch: true,
      render: (_) => formatBytes(_ as number),
    },
    // 如果 expandFile 为 true，就在这里插入 extraColumn
    ...(expandFile ? [extraColumn] : []),
    {
      title: '修改时间',
      width: 80,
      dataIndex: 'updatedAt',
      hideInSearch: true,
      render: (_) => {
        if (typeof _ !== 'number') return '未知';
        return expandFile ? DateTo(_) : tipTime(_);
      }
    },
    {
      title: '创建时间',
      width: 80,
      key: 'since',
      hideInSearch: true,
      dataIndex: 'createdAt',
      render: (_) => {
        if (typeof _ !== 'number') return '未知';
        return expandFile ? DateTo(_) : tipTime(_);
      }
    },
  ] as ProColumns<TableListItem>[];
};

const tipTime = (time: number) => {
    const inputDate = dayjs(time as number);
    return <Tooltip title={DateTo(time as number)}>
        {inputDate.format('YYYY-MM-DD')}
    </Tooltip>
}
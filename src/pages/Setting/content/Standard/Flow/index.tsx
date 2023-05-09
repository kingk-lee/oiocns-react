import { Button, Card, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import cls from './index.module.less';
import { AiOutlineExclamation } from 'react-icons/ai';
import CardOrTable from '@/components/CardOrTableComp';
import FlowCard from './Comp/FlowCard';
import { FlowColumn } from '@/pages/Setting/config/columns';
import useObjectUpdate from '@/hooks/useObjectUpdate';
import WorkDefineModal from './modal';
import Design from './Design';
import { IWorkItem } from '@/ts/core/thing/app/work/workitem';
import { orgAuth } from '@/ts/core/public/consts';
import PageCard from '@/components/PageCard';
import { IFlowDefine } from '@/ts/core';

interface IProps {
  current: IWorkItem;
}

/**
 * 流程设置
 * @returns
 */
const FlowList: React.FC<IProps> = ({ current }: IProps) => {
  const parentRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<string>('work');
  const [key, setForceUpdate] = useObjectUpdate(current);
  const [define, setDefine] = useState<IFlowDefine>();
  const [modalType, setModalType] = useState('');
  const items = [
    {
      label: `办事定义`,
      tab: '办事定义',
      key: 'work',
    },
  ];
  const renderOperation = (record: IFlowDefine): any[] => {
    let operations: any[] = [
      {
        key: 'editor',
        label: '编辑',
        onClick: () => {
          setDefine(record);
          setModalType('edit');
        },
      },
      {
        key: 'design',
        label: '设计',
        onClick: () => {
          setDefine(record);
          setModalType('design');
        },
      },
    ];
    if (current.current.hasAuthoritys([orgAuth.ThingAuthId])) {
      operations.push({
        key: 'delete',
        label: '删除',
        style: { color: 'red' },
        onClick: async () => {
          Modal.confirm({
            title: '确定删除流程?',
            icon: <AiOutlineExclamation />,
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
              if (await record.deleteDefine()) {
                message.success('删除成功');
                setForceUpdate();
              }
            },
          });
        },
      });
    }
    return operations;
  };
  /** 操作按钮 */
  const renderButton = () => {
    switch (activeTab) {
      case 'work':
        return (
          <Button
            key="edit"
            type="link"
            onClick={() => {
              setModalType('create');
            }}>
            新增办事
          </Button>
        );
      default:
        return <></>;
    }
  };

  const content = () => {
    switch (activeTab) {
      case 'work':
        switch (modalType) {
          case 'design':
            if (define) {
              return (
                <Design
                  IsEdit={true}
                  current={define}
                  species={current}
                  onBack={() => setModalType('')}
                />
              );
            }
            return <></>;
          default:
            return (
              <div style={{ background: '#EFF4F8' }}>
                <Card bordered={false} bodyStyle={{ paddingTop: 0 }}>
                  <div className={cls['app-wrap']} ref={parentRef}>
                    <CardOrTable<IFlowDefine>
                      extra={[
                        <Button
                          key="edit"
                          type="link"
                          onClick={() => {
                            setModalType('create');
                          }}>
                          新增办事
                        </Button>,
                      ]}
                      columns={FlowColumn}
                      parentRef={parentRef}
                      dataSource={current.defines}
                      operation={renderOperation}
                      rowKey={(record: IFlowDefine) => record.metadata.id}
                      renderCardContent={(items) => {
                        return items.map((item) => (
                          <FlowCard
                            className="card"
                            data={item}
                            key={item.metadata.id}
                            operation={renderOperation}
                          />
                        ));
                      }}
                    />
                  </div>
                </Card>
              </div>
            );
        }
      default:
        return <></>;
    }
  };

  return (
    <div className={cls['company-top-content']} key={key}>
      <PageCard
        key={key}
        bordered={false}
        activeTabKey={activeTab}
        tabList={items}
        onTabChange={(key) => {
          setActiveTab(key);
        }}
        tabBarExtraContent={renderButton()}
        bodyStyle={{ paddingTop: 16 }}>
        {content()}
      </PageCard>
      {
        <WorkDefineModal
          item={current}
          current={define}
          open={['edit', 'create'].includes(modalType)}
          handleCancel={function (): void {
            setModalType('');
          }}
          handleOk={() => {
            setDefine(undefined);
            setForceUpdate();
            setModalType('');
          }}
        />
      }
    </div>
  );
};

export default FlowList;

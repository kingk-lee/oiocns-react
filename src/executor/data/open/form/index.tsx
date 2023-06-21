import React from 'react';
import FullScreenModal from '@/executor/tools/fullScreen';
import { IFormView } from '@/ts/core';
import Thing from './Thing/Thing';
import * as config from './config';
import EntityIcon from '@/components/Common/GlobalComps/entityIcon';
import MainLayout from '@/components/MainLayout';
import useMenuUpdate from '@/hooks/useMenuUpdate';

interface IProps {
  form: IFormView;
  finished: () => void;
}

/** 表单查看 */
const FormView: React.FC<IProps> = ({ form, finished }) => {
  const [key, rootMenu, selectMenu, setSelectMenu] = useMenuUpdate(() =>
    config.loadSpeciesItemMenu(form),
  );
  if (!selectMenu || !rootMenu) return <></>;
  return (
    <FullScreenModal
      centered
      open={true}
      fullScreen
      width={'80vw'}
      title={form.name}
      bodyHeight={'80vh'}
      icon={<EntityIcon entityId={form.id} />}
      destroyOnClose
      onCancel={() => finished()}>
      <MainLayout
        notExitIcon
        selectMenu={selectMenu}
        onSelect={(data) => {
          setSelectMenu(data);
        }}
        siderMenuData={rootMenu}>
        <Thing
          key={key}
          labels={selectMenu.item ? [`S${selectMenu.item.id}`] : []}
          propertys={form.attributes.map((i) => i.property!)}
          belongId={form.metadata.belongId}
          menuItems={[
            {
              key: 'listStore',
              label: '上架商店',
              click(data) {
                console.log(data);
              },
            },
            {
              key: 'nft',
              label: '生成NFT',
              click(data) {
                console.log(data);
              },
            },
            {
              key: 'assign',
              label: '分配',
              click(data) {
                console.log(data);
              },
            },
            {
              key: 'share',
              label: '共享',
              click(data) {
                console.log(data);
              },
            },
            {
              key: 'handle',
              label: '处置',
              click(data) {
                console.log(data);
              },
            },
          ]}
        />
      </MainLayout>
    </FullScreenModal>
  );
};

export default FormView;

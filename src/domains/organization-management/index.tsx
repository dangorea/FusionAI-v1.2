import { CommonToolbar, LayoutContainer } from '../../components';
import {
  OrganizationManagementBlockTable,
  OrganizationManagementModalForm,
} from './components';
import { useOrganizationManagement } from './useOrganizationManagement';

function OrganizationManagement() {
  const {
    selectedManagements,
    handleDeleteOrganizationManagement,
    isModalOpen,
    setIsModalOpen,
    managements,
    selectedOrgIds,
    handleSelectChange,
    currentPage,
    pageSize,
    total,
    handlePageChange,
    handleSearch,
  } = useOrganizationManagement();

  return (
    <LayoutContainer>
      <CommonToolbar
        title="Organization Management Submission Form"
        selectedItems={selectedManagements}
        onDelete={handleDeleteOrganizationManagement}
        open={isModalOpen}
        setOpen={setIsModalOpen}
      >
        <OrganizationManagementModalForm
          selectedManagements={selectedManagements}
          setIsModalOpen={setIsModalOpen}
        />
      </CommonToolbar>

      <OrganizationManagementBlockTable
        organizationManagements={managements}
        selectedRowKeys={selectedOrgIds}
        onSelectChange={handleSelectChange}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        setOpen={setIsModalOpen}
      />
    </LayoutContainer>
  );
}

export { OrganizationManagement };

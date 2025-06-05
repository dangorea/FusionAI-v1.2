import { ProjectTable, ProjectModalForm } from './components';
import { LayoutContainer, CommonToolbar } from '../../components';
import { useProjects } from './useProjects';

function Projects() {
  const {
    selectedProjects,
    handleDeleteProject,
    isModalOpen,
    setIsModalOpen,
    projects,
    handleSelectChange,
    selectedProjectsIds,
    currentPage,
    pageSize,
    total,
    handlePageChange,
    handleSearch,
  } = useProjects();

  return (
    <LayoutContainer>
      <CommonToolbar
        title="Project Submission Form"
        selectedItems={selectedProjects}
        onDelete={handleDeleteProject}
        open={isModalOpen}
        setOpen={setIsModalOpen}
      >
        <ProjectModalForm
          selectedProjects={selectedProjects}
          setIsModalOpen={setIsModalOpen}
        />
      </CommonToolbar>

      <ProjectTable
        projectBlocks={projects}
        onSelectChange={handleSelectChange}
        setOpen={setIsModalOpen}
        selectedRowKeys={selectedProjectsIds}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </LayoutContainer>
  );
}

export { Projects };

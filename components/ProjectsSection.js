import Image from 'next/image';

const ProjectsSection = () => {
  const projects = [
    {
      id: 1,
      image: '/projects/1.jpg',
      title: 'GEMS ROYAL DUBAI SCHOOL',
      description: 'Explore our commitment to supporting learning spaces with GEMS Education',
      alt: 'Teacher working with two students'
    },
    {
      id: 2,
      image: '/projects/2.jpg',
      title: 'AMITY SCHOOL DUBAI',
      description: 'Explore our long history with Amity school',
      alt: 'Two young boys smiling'
    },
    {
      id: 3,
      image: '/projects/3.jpg',
      title: 'ARCADIA GLOBAL SCHOOL, DUBAI',
      description: "A deeper look at our collaboration with Arcadia School, Dubai's most premium British curriculum institution...",
      alt: 'Man standing in a modern school hallway'
    }
  ];

  return (
    <section className="projects py-16 md:py-24 bg-white" id="projects">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-black mb-10">PROJECTS</h2>
        <div className="projects__grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <Image
                src={project.image}
                alt={project.alt}
                width={400}
                height={300}
                className="w-full rounded-lg mb-4 object-cover h-48 md:h-60"
              />
              <h3 className="text-base font-semibold text-black mb-2 leading-6">
                {project.title}
              </h3>
              <p className="text-sm leading-6 text-medium-gray">
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection; 
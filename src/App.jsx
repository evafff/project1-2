import { useEffect, useRef, useState } from 'react';
import BlurText from './BlurText.jsx';
import CircularGallery from './CircularGallery.jsx';
import ShinyText from './ShinyText.jsx';
import SplitText from './SplitText.jsx';
import TiltedCard from './TiltedCard.jsx';
import './App.css';

const navItems = [
  { label: '工作经历', href: '#experience' },
  { label: '精选作品', href: '#works' },
  { label: '个人优势', href: '#strengths' },
];

const baseHeroCards = [
  '/assets/hero-st8.png',
  '/assets/hero-st4.png',
  '/assets/hero-st5.png',
  '/assets/hero-st7.png',
  '/assets/hero-st3.png',
  '/assets/hero-st2.png',
  '/assets/hero-st6.png',
  '/assets/hero-st1.png',
];

const heroCardStages = ['调研', '梳理', '构思', '情绪', '草图', '视觉', '规范', '交付'];

const heroGalleryItems = baseHeroCards.map((image, index) => ({
  image,
  stage: heroCardStages[index],
  index,
  text: `WORK ${String(index + 1).padStart(2, '0')}`,
}));

const HERO_TITLE_DELAY = 55;
const HERO_TITLE_STEP_DURATION = 0.32;
const FIRST_TITLE_TEXT = 'DONG YIFEI';
const SECOND_TITLE_TEXT = 'PORTFOLIO';
const SECOND_TITLE_START_DELAY =
  (FIRST_TITLE_TEXT.length - 1) * HERO_TITLE_DELAY +
  HERO_TITLE_STEP_DURATION * 2 * 1000;

const workCards = [
  {
    slug: 'app-product',
    title: 'APP产品设计',
    subtitle: '移动端设计 / 交互体验 / 设计系统',
    period: 'UI-UX设计',
    description: '围绕移动端核心业务场景，完成产品架构、交互流程与视觉界面的统一设计，优化用户操作路径、信息层级与关键功能触达效率，提升产品易用性、品牌识别度与整体体验。',
    image: '/assets/work-app.png',
    detailImage: '/assets/app-project-long.png',
    detailIntro: '围绕移动端核心业务场景，完成产品架构、交互流程与视觉界面的统一设计，让复杂功能在更清晰的信息层级中被快速理解与使用。',
    detailHeading: '从业务路径到界面系统的完整设计',
    detailSteps: [
      ['产品架构梳理', '拆解核心任务与用户路径，明确页面层级、入口优先级和关键转化节点。'],
      ['交互流程优化', '围绕高频操作减少跳转成本，提升表单、筛选、详情查看等流程效率。'],
      ['视觉系统落地', '建立统一的组件、色彩、图标和排版规范，保证多页面体验一致。'],
    ],
  },
  {
    slug: 'data-dashboard',
    title: '数据大屏设计',
    subtitle: '数据可视化 / 指标体系 / 大屏展示',
    period: '可视化设计',
    description: '基于业务数据与管理目标构建可视化展示体系，通过指标分层、图表组合与空间布局，将复杂数据转化为清晰直观的信息内容，提升数据洞察、实时监控与辅助决策效率。',
    image: '/assets/work-data.png',
    detailImage: '/assets/data-dashboard-detail.png',
    detailImages: ['/assets/data-dashboard-detail.png', '/assets/data-traffic-detail.png'],
    detailIntro: '基于业务数据与管理目标构建可视化展示体系，通过指标分层、图表组合与空间布局，将复杂数据转化为清晰直观的信息内容。',
    detailHeading: '从数据指标到大屏展示的可视化设计',
    detailSteps: [
      ['指标体系梳理', '围绕管理目标拆分核心指标、辅助指标和状态指标，让信息层级更清晰。'],
      ['图表组合设计', '根据数据类型选择图表表达方式，平衡视觉冲击力与信息可读性。'],
      ['大屏场景落地', '结合展示距离与监控节奏优化布局，提升实时洞察和辅助决策效率。'],
    ],
  },
  {
    slug: 'admin-system',
    title: '后台系统设计',
    subtitle: '后台界面 / 业务流程 / 组件规范',
    period: 'B端产品设计',
    description: '围绕业务管理、数据配置与运营协同场景，建立统一的后台界面与组件规范，优化复杂表单、数据列表及任务流程，提高信息检索效率、操作准确性与系统管理能力。',
    image: '/assets/work-admin.png',
    detailImage: '/assets/admin-account-detail.png',
    detailImages: ['/assets/admin-account-detail.png', '/assets/admin-page-intro-detail.jpg'],
    detailIntro: '围绕业务管理、数据配置与运营协同场景，建立统一的后台界面与组件规范，提高信息检索效率、操作准确性与系统管理能力。',
    detailHeading: '从业务流程到后台组件规范的系统设计',
    detailSteps: [
      ['业务流程拆解', '梳理角色权限、任务路径和关键操作，降低复杂业务的理解成本。'],
      ['组件规范建立', '统一表单、列表、筛选、弹窗等后台高频组件，提升页面复用效率。'],
      ['管理效率优化', '优化数据检索、配置编辑和状态反馈，让后台操作更准确稳定。'],
    ],
  },
];

const experiences = [
  {
    time: '2022.02 - 2026.06',
    company: '山东水发华夏家源产业发展有限公司',
    role: 'UI设计师',
    body: '负责公司可视化系统界面设计及相关后台设计，完成各项目界面设计及规范设定。',
  },
  {
    time: '2020.03 - 2022.02',
    company: '山东旗帜信息有限公司',
    role: 'UI设计师',
    body: '负责公司 APP 及 PC 端网站用户界面设计，完成外包项目界面设计及规范设定。',
  },
  {
    time: '2019.03 - 2020.03',
    company: '济南鼎高信息技术有限公司',
    role: 'UI设计师',
    body: '参与项目视觉风格设定、页面设计与设计规范输出，推进界面体验落地。',
  },
  {
    time: '2016.10 - 2019.02',
    company: '北京佳益伟业商贸有限公司',
    role: 'UI设计师',
    body: '负责门户、运营与活动页面设计，根据业务需求完成视觉页面重构。',
  },
];

const strengths = [
  {
    number: '01',
    label: 'CORE',
    title: '完整项目主导能力',
    body: '从需求理解、风格探索、界面输出到规范沉淀，能稳定推进中后台、APP 和可视化项目落地。',
    featured: 'dark',
  },
  {
    number: '02',
    label: 'CORE',
    title: '品牌视觉体系搭建',
    chips: ['品牌识别系统梳理', '视觉规范与延展模板', '统一多渠道传播质感'],
    featured: 'lime',
  },
  {
    number: '03',
    label: 'SYSTEM',
    title: 'AI 设计提效',
    body: '熟悉 AI 辅助视觉探索、素材生成与方案迭代，让设计产出更高效。',
  },
  {
    number: '04',
    label: 'SYSTEM',
    title: '设计管理统筹',
    body: '能梳理组件、规范、交互和视觉语言，保证多页面项目的一致性。',
  },
  {
    number: '05',
    label: 'SYSTEM',
    title: '跨部门协同',
    body: '理解产品、开发和运营诉求，擅长把抽象目标转化为清晰界面。',
  },
];

function Header({ rootLinks = false }) {
  const linkTo = (href) => (rootLinks ? `/${href}` : href);

  return (
    <header className="site-header">
      <a className="brand-pill" href={linkTo('#home')} aria-label="回到首页">
        <img className="brand-icon" src="/assets/nav-icon.png" alt="" />
        <strong>YIFEI</strong>
      </a>
      <nav aria-label="主导航">
        {navItems.map((item) => (
          <a key={item.href} href={linkTo(item.href)}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="contact-pill" href={linkTo('#contact')}>
        联系我
      </a>
    </header>
  );
}

function SectionTitle({ eyebrow, title, animated = false }) {
  return (
    <div className="section-title">
      <h2>
        {animated ? (
          <SplitText
            text={title}
            className="section-title-text"
            delay={34}
            duration={0.72}
            ease="easeOut"
            splitType="chars"
            from={{ opacity: 0, y: 46, filter: 'blur(8px)' }}
            to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            threshold={0.28}
            rootMargin="-80px"
          />
        ) : (
          <span className="section-title-text">{title}</span>
        )}
        <span className="section-arrow">↘</span>
      </h2>
      <p>{eyebrow}</p>
    </div>
  );
}

function Hero() {
  const [showPortfolioTitle, setShowPortfolioTitle] = useState(false);
  const [activeGalleryItem, setActiveGalleryItem] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setShowPortfolioTitle(false);
    const timer = window.setTimeout(() => {
      setShowPortfolioTitle(true);
    }, SECOND_TITLE_START_DELAY);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.72;
    }
  }, []);

  useEffect(() => {
    if (!activeGalleryItem) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActiveGalleryItem(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeGalleryItem]);

  return (
    <section className="hero full-section" id="home">
      <div className="hero-video-wrap" aria-hidden="true">
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = 0.72;
          }}
          src="/assets/hero-main.mp4"
        />
      </div>
      <div className="hero-inner shell">
        <div className="hero-copy">
          <div
            className="hero-title"
            role="heading"
            aria-level="1"
            aria-label="DONG YIFEI PORTFOLIO"
          >
            <BlurText
              as="span"
              text={FIRST_TITLE_TEXT}
              delay={HERO_TITLE_DELAY}
              animateBy="letters"
              direction="top"
              stepDuration={HERO_TITLE_STEP_DURATION}
              className="hero-title-line title-primary"
            />
            <span className="hero-title-row title-secondary-row">
              {showPortfolioTitle ? (
                <BlurText
                  as="span"
                  text={SECOND_TITLE_TEXT}
                  delay={HERO_TITLE_DELAY}
                  animateBy="letters"
                  direction="top"
                  stepDuration={HERO_TITLE_STEP_DURATION}
                  className="hero-title-line title-secondary"
                />
              ) : (
                <span
                  className="hero-title-line title-secondary title-placeholder"
                  aria-hidden="true"
                >
                  {SECOND_TITLE_TEXT}
                </span>
              )}
            </span>
          </div>
          <p className="hero-subtitle">
            用清晰的界面系统与细腻的视觉表达
            <br />
            让产品体验更准确、更易识别
          </p>
        </div>
      </div>
      <div className="hero-strip" aria-label="作品预览">
        <CircularGallery
          items={heroGalleryItems}
          bend={0.9}
          borderRadius={0.08}
          scrollSpeed={2.8}
          scrollEase={0.1}
          autoSpeed={0.012}
          paused={Boolean(activeGalleryItem)}
          onItemActivate={setActiveGalleryItem}
        />
      </div>
      {activeGalleryItem ? (
        <div
          className="hero-work-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeGalleryItem.stage}作品预览`}
          onMouseDown={() => setActiveGalleryItem(null)}
        >
          <div className="hero-work-modal__panel" onMouseDown={(event) => event.stopPropagation()}>
            <button
              className="hero-work-modal__close"
              type="button"
              aria-label="关闭作品预览"
              onClick={() => setActiveGalleryItem(null)}
            >
              ×
            </button>
            <div className="hero-work-modal__meta">
              <span>DESIGN PROCESS</span>
              <strong>{String(activeGalleryItem.index + 1).padStart(2, '0')}</strong>
              <h2>{activeGalleryItem.stage}</h2>
            </div>
            <div className="hero-work-modal__image-wrap">
              <img src={activeGalleryItem.image} alt={`${activeGalleryItem.stage}阶段作品`} />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Experience() {
  const [activeCareer, setActiveCareer] = useState(null);

  return (
    <section className="experience full-section" id="experience">
      <div className="shell section-content">
        <SectionTitle eyebrow="个人经历" title="WORK EXPERIENCE" animated />
        <div className="about-grid">
          <TiltedCard
            imageSrc="/assets/avatar-new.jpeg"
            altText="董一菲头像"
            containerHeight="clamp(470px, 42vw, 600px)"
            containerWidth="100%"
            imageHeight="100%"
            imageWidth="100%"
            rotateAmplitude={8}
            scaleOnHover={1.035}
            showMobileWarning={false}
            showTooltip={false}
            className="portrait-card"
            imageClassName="portrait-card-image"
          />
          <div className="about-panel">
            <p className="mini-label">ABOUT ME</p>
            <h3>
              <ShinyText
                text="Hi, I am 董一菲!"
                speed={2.6}
                delay={0.4}
                color="#f5f7ee"
                shineColor="#c8ff25"
                spread={115}
                direction="left"
              />
            </h3>
            <p className="about-lead">
              我是 UI/GUI 设计师，拥有多年 APP、PC 网站、后台系统与可视化大屏项目经验。擅长以清晰的信息结构、稳定的视觉规范和细致的执行，把复杂业务转化为易理解的界面体验。
            </p>
            <div className="info-grid">
              <div>
                <span>当前身份</span>
                <strong>UI / GUI Designer</strong>
              </div>
              <div>
                <span>服务方向</span>
                <strong>APP / Web / Dashboard</strong>
              </div>
              <div>
                <span>手机</span>
                <strong>18364193955</strong>
              </div>
              <div>
                <span>邮箱</span>
                <strong>1061905921@qq.com</strong>
              </div>
            </div>
            <div className="stats">
              <div>
                <strong>9+</strong>
                <span>设计经验</span>
              </div>
              <div>
                <strong>30+</strong>
                <span>项目落地</span>
              </div>
              <div>
                <strong>500+</strong>
                <span>界面输出</span>
              </div>
            </div>
            <div className="building">
              <span>NOW BUILDING</span>
              <p>可视化系统 / 移动端应用 / 政企平台 / 设计规范</p>
            </div>
          </div>
        </div>
        <div
          className={`career${activeCareer !== null ? ' is-interacting' : ''}`}
          onMouseLeave={() => setActiveCareer(null)}
        >
          {experiences.map((item, index) => (
            <article
              className={`career-item${activeCareer === index ? ' is-active' : ''}`}
              key={item.company}
              tabIndex={0}
              onMouseEnter={() => setActiveCareer(index)}
              onFocus={() => setActiveCareer(index)}
              onClick={() => setActiveCareer(index)}
            >
              <span className="career-dot" />
              <time>{item.time}</time>
              <h4>{item.company}</h4>
              <p className="role">{item.role}</p>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Works({ onOpenProject }) {
  return (
    <section className="works full-section" id="works">
      <div className="shell section-content">
        <div className="works-head">
          <div>
            <h2>SELECTED WORK</h2>
            <span>精选项目</span>
          </div>
          <p>先以横版占位树立展示节奏，后续可替换为品牌 VI、商业海报、电商详情页、包装设计等真实作品。</p>
        </div>
        <div className="work-list">
          {workCards.map((card, index) => {
            return (
            <article
              className="work-card work-card--clickable"
              key={card.title}
              role="button"
              tabIndex={0}
              onClick={() => onOpenProject(card.slug)}
              onKeyDown={
                (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenProject(card.slug);
                  }
                }
              }
            >
              <div className="work-card__media">
                <img src={card.image} alt={card.title} />
              </div>
              <div className="work-card__body">
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <h3>{card.title}</h3>
                <p className="work-period">{card.period}</p>
                <p>{card.description}</p>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectDetail({ project, index }) {
  return (
    <div className="project-page">
      <Header rootLinks />
      <main>
        <section className="project-hero shell">
          <a className="project-back" href="/#works">返回精选作品</a>
          <div className="project-hero__copy">
            <span>PROJECT {String(index + 1).padStart(2, '0')}</span>
            <h1>{project.title}</h1>
            <p>{project.detailIntro}</p>
            <dl className="project-meta">
              <div>
                <dt>项目类型</dt>
                <dd>{project.subtitle.split(' / ')[0]}</dd>
              </div>
              <div>
                <dt>设计方向</dt>
                <dd>{project.period}</dd>
              </div>
              <div>
                <dt>核心输出</dt>
                <dd>{project.subtitle}</dd>
              </div>
            </dl>
          </div>
          <div className="project-hero__media">
            <img src={project.image} alt={`${project.title}项目展示`} />
          </div>
        </section>

        <section className="project-detail shell">
          <div className="project-section-head">
            <span>DESIGN DETAIL</span>
            <h2>{project.detailHeading}</h2>
          </div>
          <div className="project-detail-grid">
            {project.detailSteps.map(([title, body], stepIndex) => (
              <article key={title}>
                <strong>{String(stepIndex + 1).padStart(2, '0')}</strong>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="project-stage-list shell">
          {(project.detailImages ?? [project.detailImage ?? project.image]).map((image, imageIndex) => (
            <section className="project-stage" key={image}>
              <img src={image} alt={`${project.title}大图展示 ${imageIndex + 1}`} />
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function Strengths() {
  return (
    <section className="strengths full-section" id="strengths">
      <div className="shell section-content">
        <SectionTitle eyebrow="个人优势" title="CORE STRENGTHS" />
        <div className="strength-grid">
          {strengths.map((item) => (
            <article
              className={`strength-card ${item.featured ? item.featured : ''}`}
              key={item.number}
            >
              <div className="card-top">
                <span>{item.number}</span>
                <small>{item.label}</small>
              </div>
              <h3>{item.title}<b>.</b></h3>
              {item.chips ? (
                <div className="chip-stack">
                  {item.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              ) : (
                <p>{item.body}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact full-section" id="contact">
      <div className="shell contact-inner">
        <div className="contact-headline">
          <p>联系方式</p>
          <h2>
            LET'S BUILD
            <span>BETTER VISUAL</span>
            <mark>SYSTEMS</mark>
          </h2>
          <a className="brand-pill contact-brand" href="#home">
            <img className="brand-icon" src="/assets/nav-icon.png" alt="" />
            <strong>YIFEI</strong>
          </a>
        </div>
        <aside className="contact-card">
          <h3>CONTACT</h3>
          <dl>
            <div>
              <dt>手机</dt>
              <dd>18364193955</dd>
            </div>
            <div>
              <dt>微信号</dt>
              <dd>eva-1f</dd>
            </div>
            <div>
              <dt>邮箱</dt>
              <dd>1061905921@qq.com</dd>
            </div>
          </dl>
          <p>Visual, Interface & Product Design</p>
          <img src="/assets/contact-code.png" alt="联系二维码样式图" />
        </aside>
      </div>
    </section>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const openProject = (slug) => {
    const nextPath = `/work/${slug}`;
    window.history.pushState({}, '', nextPath);
    setCurrentPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const projectIndex = workCards.findIndex((project) => currentPath === `/work/${project.slug}`);
  if (projectIndex !== -1) {
    return <ProjectDetail project={workCards[projectIndex]} index={projectIndex} />;
  }

  return (
    <>
      <Header />
      <Hero />
      <Experience />
      <Works onOpenProject={openProject} />
      <Strengths />
      <Contact />
    </>
  );
}

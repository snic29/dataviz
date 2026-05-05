import * as d3 from 'd3';

export const loadUniversityData = async () => {
  try {
    const data = await d3.csv('/world_university_rankings_2026.csv');
    return data.map(d => ({
      ...d,
      qs_rank_2026: +d.qs_rank_2026 || null,
      the_rank_2026: +d.the_rank_2026 || null,
      arwu_rank_2025: +d.arwu_rank_2025 || null,
      qs_score: +d.qs_score || 0,
      the_score: +d.the_score || 0,
      arwu_score: +d.arwu_score || 0,
      qs_academic_rep: +d.qs_academic_rep || 0,
      qs_employer_rep: +d.qs_employer_rep || 0,
      qs_faculty_student: +d.qs_faculty_student || 0,
      qs_citations: +d.qs_citations || 0,
      qs_intl_faculty: +d.qs_intl_faculty || 0,
      qs_intl_students: +d.qs_intl_students || 0,
      the_teaching: +d.the_teaching || 0,
      the_research_env: +d.the_research_env || 0,
      the_research_quality: +d.the_research_quality || 0,
      the_industry: +d.the_industry || 0,
      the_intl_outlook: +d.the_intl_outlook || 0,
      founded: +d.founded || 0,
      total_students: +d.total_students || 0,
      intl_students_pct: +d.intl_students_pct || 0,
      nobel_laureates: +d.nobel_laureates || 0,
      fields_medalists: +d.fields_medalists || 0,
      avg_rank_all3: +d.avg_rank_all3 || 0,
      university_age_2026: +d.university_age_2026 || 0
    }));
  } catch (error) {
    console.error('Error loading university data:', error);
    return [];
  }
};

export const getRegionalAverages = (data) => {
  return d3.rollup(
    data,
    v => ({
      count: v.length,
      avgAcademicRep: d3.mean(v, d => d.qs_academic_rep),
      avgCitations: d3.mean(v, d => d.qs_citations),
      avgIndustryIncome: d3.mean(v, d => d.the_industry),
      avgInternationalOutlook: d3.mean(v, d => d.the_intl_outlook),
      avgQSRank: d3.mean(v, d => d.qs_rank_2026),
      avgTHERank: d3.mean(v, d => d.the_rank_2026),
      avgARWURank: d3.mean(v, d => d.arwu_rank_2025)
    }),
    d => d.region
  );
};

export const getCountryAverages = (data) => {
  return d3.rollup(
    data,
    v => ({
      count: v.length,
      avgAcademicRep: d3.mean(v, d => d.qs_academic_rep),
      avgCitations: d3.mean(v, d => d.qs_citations),
      avgIndustryIncome: d3.mean(v, d => d.the_industry),
      avgInternationalOutlook: d3.mean(v, d => d.the_intl_outlook),
      universities: v.map(d => d.university)
    }),
    d => d.country
  );
};

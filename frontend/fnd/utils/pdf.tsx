import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';
import { AnalysisData, RedditPost } from "@/types/analysis"

// PDF Document component
export const EmptyReport = () => (
    <Document>
        <Page size="A4" style={styles.page} >
            <View style={styles.section}>
                <Text style={styles.title}> This PDF is empty </Text>
            </View>
        </Page>
    </Document>
)

const file_textBase64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAsJJREFUaEPtmc1qE1EUx/8npGsXZtLgqouZQfQBRNypi7oQanEZwWRisb6AILgSF76AlrZJBe2u+AGiiC5d+AJ+kImCCynkjuAD6BwZMCUZ5+PeO5NJB5Nt/vfc/+/MveckZwgl/1DJ/UMKwHS8KwCvEnAawGJO0J+YcXfQM3azxEsEWLo6bFQrtEuEs1k2SVrLRDcG27UHuvETAUxHvCPgjG5w2XXEWOv3jC1Z/bguFsB2RIcBraA6RsBYd3vGhuraJIBXDCwfBGTaoypu9zdrn1U3CfSWIzh1nQZELIDliJ8Ajow2Zb9ycrBz9GOqiRhBGCA4NkzYDMtVj1MSwETG3K4hVbHiAMMAQTy7La5lhZgpQACbFWLmAFkhDgVAFojCAGxH7DPQSCoKZsdbJ+b74XvEjGZcxy4MwHTESwIujJfl375/6+vDujtu2GqL6yBMdGYCvvW7xlJUgSgMwHa8FQY/1S3DcVWwMIC/zewtgHM6ELkDWK1hCxW6B8AIGRLw+aa7U98JGw1+HC5U6REY51Uh8gdwxDDC/MiXcLtGPc6k2fGaBH8VTKcAHJOBOVQAMoajOneul1jnCMkYH2mmDqBiRkc7B5DNgE52ZdbI7l9oH5AxXtgdSLjEKj4DbWTfmPoTsJL7gDJEuG/MAdIyUPojpHpGVPVpCRzF+3+rkGpGVfXzJ5CWgdJf4nkfmLwU//wBSjsBmatQ6Y+QalVR1U/9CagaUtXPAWQzoJpZWb3s/klvaFJnmbJmVHVm68cJqvgfxtbtu10jcvwSCyA7y1Q1l6a317zj/At3QHz5QMt44faMi0pjFbvtXWLiJ2kbFvE9V/zlwdbiayWAQGw5QnuWmRcYAc/7XWMlLl7qi27dWWY+APzGX/CbXzYawRgz8iP14k5nlqkNQPgOpvdMeDbYrj1OiyMFkBZklt+XHuAPPV0FTzN7JvcAAAAASUVORK5CYII=+3iV5As1k7lUSwsNRCWCxEK/vFTox4BA8heAEx1nsFwcrCQsFKsHj+KSWbHCGbJ1EjSTDJZteAgqlCMvO+mfnNmxE0/Ij0+fN7g860Jo4VbANmJVtwp7fYeTg1XotsMwDL8fsCepUHZw2edI1uESQDsJ1BAGIG1IZ021dFINvx1ee/R8ACZCii7suZ6eV9coAPR+kame95pwQQiqijq9Y1sAg8hyJaz0MmAsSBLBx4ZhlkXIAPzCalXD7058IhcUktUPfSba8kWY8FqGqGdIlLAfa+f4Ng9T0axa08N9bi17idpzRxAmwBRl6jiQFV3TUyoOZ9IOmu3wPIaFCUTkqb2hk0DvjXIK7A6BetCZH/pAaZKVkngyUn2FSoSyCQrvE1n35iZebj6EvX2P12XFdNyYqMPCXUxRB1lN5qpauxTomKbN8Ajbn4GdX54b4AAAAASUVORK5CYII='
const file_textBase64Uri = `data:image/png;base64,${file_textBase64}`
const newspaper_Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAyRJREFUaEPtWk1rE1EUPXdS1wqSl6JLRaX9A4orRcG+2lKl3dSZQtH/4EaloiD+BoVKZ+xCq6JtJ2DRlQvRtUVxbbUziG5cCMlcmdZpkubjvcnMJE1pVgnv3nvOmXvfx7wbQo9/qMf5oy0BYk5aMDAG5pMAHcr2IfAaiN4D9MIzl53tWLEE5GdlP/XhMYCz2ZJuGn0FuT7Lm3y1HlnEEiBs+Q7A6S6R/w9Lbzxr+VxsAQVbXmPgQXfJb6IzY9qfch+F37UzIGxZBHChIoAWyjnj5s/Jxc9Zijo4P3IiVw7uADwe4TCw6FvuaFwBvwHsj4IYxIM/zOJqluSj2P3O0EDA9KmCxWueVTwcVwBXk/UsVzt7aYgUtmyIr02iWYA0yOnEyFxA3hkaJ6a7AI7rEGph84WJb/hmcaHaJnMBwpZhjQ4kJB+5r3qWO9hpATU1mlTI9jnWiQzsLgFxVynVItHxDHRVwMZpk3AZwCkAhUb1rFujunMhlQyI+dECyiUbwHkV8I4UkJ+Tb4lwRkU+HFcJ0InRykYVPxrf2okLc8NXmfihLrAKQDdOMztV/DoBwpYugKFmp02NGu3uRiZs2fK0qRKweZQw7gF8NOHTb+8ooSKoGk9IWumu3AdUBFXjSgYJDfYE7PoM5G05TcB9APmE1eIzcN233Fn94zSDhCODKgf2LNfQCRDZCFt6KZCPwvme5Qod/M2NbE8A0PMllLDule6tl9GZGUMc+VCuihJ4lpvTqUElckoGewJ29j6QQgm1MYkbrvfNKi7zEmpzH6hb79sT8GQiJ/7+KVU5lz3L7YsziXteQHdLKIUMpLRaNg3Teg70vAAAwpa/AByIHgEbxjH/ytLX8Hd9gwHfPcvNuDtZSUYr/K1bie0tJCI8LRm5W/uCkhGwcbumxcNY8qfckazLpvLwmuNXBDgXL4GD550glRSDiaVvFsOeXW2Tr/5qJSlUBv6El57pjkWRa1pMG1eLQckBY6sPmwGFJCFXiEvm+tTr8OVp49OwRyacYRMcTAAUXu4mfUVMQjj0/QbgI4ieJf6rQVImWfhrdymzAE8j5j9g7X5P76H8oQAAAABJRU5ErkJggg==/ruBL9Nyz4DMITQ/Vo4ctSsHisb6I3ag3D6LNSCrFNNk23dKCuWZ3ft98M7NDmPNHpvjetVilBVyCsQegaKmhC8IDf6ESXqgXM6AmGkQ4tAw8dJwZN+G5OjICioF4Z2CJHZTCU/VkA1qplUsOURvAq5bKMwL8QHAcVEtl/J8HTN6fCOAF5UcCbY0LzOB2KJvb8RlrwOBCnvJBxlMDRlmWtjQDGNWWJkWmLPIB5raMtFRu0tOpLUq3ZVrRJEUGoaXP1K6xyONSzFOdZ1m/TecLYJBfFxEA1lI5JqAXiA4B6+PnAM+hVBtZi+YOqFYdf63TA5Dpmtk8Ff8BMKoGjD/fk/UZnuTbA9f//PgG0NNSFWyKPDOA7Sxk3iK/Jt5AWOYo2nRcLDI7rcHCsA1erO/vJO/3B82bwYpMC2FwI5TN419AvORdXIEQvyWererU+S6Ae7iFij656061Em0E/AAyYTYoaW+vJwAAAABJRU5ErkJggg=='
const newspaper_Base64Uri = `data:image/png;base64,${newspaper_Base64}`
const users_Base64 = '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'
const users_Base64Uri = `data:image/png;base64,${users_Base64}`
const shield_Base64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAA8RJREFUaEPtmVnITVEUx38fkimzzFMoUSRTyIN4MSeRjxfFgxQpmcoUQjIU4UGEzFMyJ/LEgykZH8wzmfJgSInzr320Xefcs8+959x8dVZ9fd2z915r/fdee+29/6uMCi5lKfvfCagC3EzLTloA+gIHgObG8ZfAWOBS0kCSBiB9C4BFQKUcZ3+athVJgkgSQH1gPzAowsHTQDnwOQkgSQCQjknAcqCRo1NvgLnATm+1fjmOCexWLIABwBqgW4D2V8AY4+AhoFlAn2vALOBCoSDiAKgFNAaaAoOB8UCbEMPngXHAe9PeENgHDAzp/wjYA5wBtDoPXQFFARgJzAY6A3UclS4Elob01QZf4qhHe+SOCc2TYWPyARgGHHc0pm7HgHleurwbMUZnw0pgeAzdQ4FTQf3zAbgIKJ/nE4XICW/zbgSuxnBIXXt74TLFAGkQMVbnR7+4AD4Bda1B+n3f/GlpzwFXYjod1r2XSb8K1Q5Ae6Ce1fkjEAgy3wrkpreo/ZIQlj9qnOxnAJKedktftgJOM5CtQPgMOE1gtomzEMpCqMgZyEKoyAnMstD/HEJfgeqWgzWAbyk6bKuWrS/WB/lSM+574DnQwhrUymMf9K0U0hp4Yhl6BujbP5JvD9wAulojxDzoWymkR85j6br3vO0eF4BIKtGBvkwEdpTCe2CyR0tusWyJsZgQF8A0YL01SNyOeJ5SyFFAjIgvUz1KZ3NcAAoZLZ0vP4AmgN7GaYrYvRcenVLVMtIFuBUXgPaHHvHtrIHie8T7pCkif0U7+iLSy/bhL9tRD/UZHqG1zhqh1Cbm4GlKCOTobY83qmbpn+4xEhvC7EUBqA28BpSXfRFf1L9YUjbAIdHxl3OyjfK/Qkr/AyUKgAbNMUyarWAmsDbhVQiyI+J3dT47LgAqm8qKyCdfVKwQx38wIRBKkUrRsuWLmOueUSvtAkAKOwL3ApwVWbusSBDzQ8hgMXQPonS7ApCeEcBhU7Sz9Yrb12q8jTKW0y6qfi+gGoMtStc6A0S1R0ocAFIWxliL5F1sSN5Io4Ayi1ZPdYNcCWWigxTHBSAdfUwtrGWAwsfGsd0hKBTrOkvaBrTrojg6LmFcCADZVkFvl6nUBPn6wbRvNY2628j5MBr9rLl3xS78FQrAd1qxvyrn2u0SQn4fXRlUAdJeKEiKBSCjOuR09Ctn2ydoPoe+m/yua0PoIeWCKAkAvh09eHRr1LVbGSZI3gHbgE2AHilFS5IAbGeGmDv9KPPxiFfR3B6z5uYELi0ATsaT6FThAfwGfE+sMW/pOPYAAAAASUVORK5CYII='
const shield_Base64Uri = `data:image/png;base64,${shield_Base64}`

// PDF Analysis Report Component
export const AnalysisReport = ({ data }: { data: AnalysisData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <PDFImage src={shield_Base64Uri} style={styles.headerLogo} />
                <Text style={styles.headerText}>de(fnd)</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>{data.title}</Text>
                <Text style={styles.subtitle}>Written By: {data.author}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>Introduction</Text>
                <Text style={styles.text}>{data.article_summary}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>Analysis Categories</Text>

                <View style={styles.iconRow}>
                    <PDFImage src={file_textBase64Uri} style={[styles.categoryIcon]} />
                    <Text style={styles.subheading}>Content Analysis</Text>
                </View>
                <Text style={styles.text}>{data.content_analysis}</Text>

                <Text style={styles.text}>Tone: {data.tone}</Text>
                <Text style={styles.text}>{data.tone_explanation}</Text>

                <Text style={styles.text}>Bias: {data.bias}</Text>
                <Text style={styles.text}>{data.bias_explanation}</Text>

                <View style={styles.iconRow}>
                    <PDFImage src={newspaper_Base64Uri} style={[styles.categoryIcon]} />
                    <Text style={styles.subheading}>Source Credibility</Text>
                </View>
                <Text style={styles.text}>{data.author_publisher_explanation}</Text>
                <Text style={styles.text}>Author: {data.author}</Text>
                <Text style={styles.text}>Publisher: {data.publisher}</Text>

                <View style={styles.iconRow}>
                    <PDFImage src={users_Base64Uri} style={[styles.categoryIcon]} />
                    <Text style={styles.subheading}>Social Analysis</Text>
                </View>
                <Text style={styles.text}>{data.reddit_sentiment_summary}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>Conclusion</Text>
                <Text style={styles.text}>{data.recommendation}</Text>
                <Text style={styles.score}>Credibility Score: {data.recommendation_score}%</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>Appendix - References</Text>

                {data.content_analysis_biblio?.map((link: string, index: number) => (
                    <Text key={`content-${index}`} style={[styles.link, styles.blueText]}>{link}</Text>
                ))}

                {data.source_analysis_biblio?.map((link: string, index: number) => (
                    <Text key={`source-${index}`} style={[styles.link, styles.greenText]}>{link}</Text>
                ))}

                {data.reddit_posts?.map((post: RedditPost, index: number) => (
                    <Text key={`reddit-${index}`} style={[styles.link, styles.orangeText]}>{post.url}</Text>
                ))}
            </View>
        </Page>
    </Document>
);

// PDF styles
const styles = StyleSheet.create({
    page: { padding: 40 },
    title: { fontSize: 24, marginBottom: 10 },
    subtitle: { fontSize: 16, marginBottom: 20, color: '#666' },
    section: { marginBottom: 20 },
    heading: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
    subheading: { fontSize: 14, marginBottom: 5, fontWeight: 'bold' },
    text: { fontSize: 12, marginBottom: 10, lineHeight: 1.5 },
    score: { fontSize: 16, marginBottom: 10 },
    link: { fontSize: 10, color: '#0066cc', marginBottom: 5 },
    articleImage: {
        width: '100%',
        maxHeight: '200px',
        objectFit: 'contain',
        marginVertical: 10,
    },
    categoryIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    blueText: { color: '#2563eb' },
    greenText: { color: '#16a34a' },
    orangeText: { color: '#f97316' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
        borderBottom: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerLogo: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});